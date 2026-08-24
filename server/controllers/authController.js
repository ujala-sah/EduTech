const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const { sendOtpEmail } = require('../utils/mailer');
const { notifyUsers } = require('../utils/notify');
const { normalizeEmail, isGmailAddress, isDuplicateEmailError } = require('../utils/email');

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitizeUser = (user) => {
  const data = user.toObject();
  delete data.password;
  return data;
};

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const sendOtp = async (req, res) => {
  try {
    const { name, email, password, phone, department, role } = req.body;
    const selectedRole = role === 'teacher' ? 'teacher' : 'student';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isGmailAddress(normalizedEmail)) {
      return res.status(400).json({ message: 'Use a Gmail address so the verification code can be delivered.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this Gmail already exists. Ask an admin to delete the old account if you need to register again.',
      });
    }

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);

    await PendingRegistration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: selectedRole,
        phone: phone || '',
        department: department || '',
        otpHash: hashOtp(otp),
        otpExpires: new Date(Date.now() + OTP_TTL_MS),
        attempts: 0,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(normalizedEmail, otp, name);

    res.json({
      message: `A 6-digit verification code was sent to ${normalizedEmail}.`,
      email: normalizedEmail,
      emailSent: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || 'Unable to send verification code. Please try again.',
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const pending = await PendingRegistration.findOne({ email });
    if (!pending) {
      return res.status(404).json({ message: 'No pending registration found for this email. Start registration again.' });
    }

    const otp = generateOtp();
    pending.otpHash = hashOtp(otp);
    pending.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    pending.attempts = 0;
    await pending.save();

    await sendOtpEmail(email, otp, pending.name);
    res.json({
      message: 'A new verification code was sent to your Gmail.',
      emailSent: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message || 'Unable to resend verification code. Please try again.',
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const pending = await PendingRegistration.findOne({ email });
    if (!pending) {
      return res.status(404).json({ message: 'No pending registration found. Please register again.' });
    }

    if (pending.otpExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: 'This verification code has expired. Request a new one.' });
    }

    if (pending.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new code.' });
    }

    if (pending.otpHash !== hashOtp(otp)) {
      pending.attempts += 1;
      await pending.save();
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await pending.deleteOne();
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const user = new User({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      role: pending.role,
      phone: pending.phone,
      department: pending.department,
      studentId: pending.role === 'student' ? `STU${Date.now().toString().slice(-8)}` : '',
      employeeId: pending.role === 'teacher' ? `TCH${Date.now().toString().slice(-8)}` : '',
      enrollmentDate: pending.role === 'student' ? new Date() : undefined,
      isEmailVerified: true,
      isApproved: false,
      isActive: false,
    });
    user._skipPasswordHash = true;
    await user.save();
    await pending.deleteOne();

    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    await notifyUsers(
      admins.map((admin) => admin._id),
      {
        title: 'New account pending approval',
        message: `${user.name} registered as a ${user.role} and is waiting for approval.`,
        type: 'announcement',
        link: user.role === 'teacher' ? '/teachers' : '/students',
      }
    );

    res.status(201).json({
      message: 'Email verified. Your account is waiting for admin approval before you can log in.',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error(error);
    if (isDuplicateEmailError(error)) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Unable to verify the code. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({ message: 'Please verify your email with the OTP sent to your Gmail before logging in.' });
    }

    if (user.isApproved === false || user.isActive === false) {
      return res.status(403).json({
        message: 'Your account is waiting for admin approval. You can log in after an administrator activates it.',
      });
    }

    res.json({
      token: createToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to login. Please try again.' });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'dateOfBirth', 'address'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });

    if (req.file) {
      req.user.profilePhoto = `/uploads/${req.file.filename}`;
    }

    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update profile. Please try again.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to change password. Please try again.' });
  }
};

module.exports = { sendOtp, resendOtp, verifyOtp, login, getMe, updateProfile, changePassword };
