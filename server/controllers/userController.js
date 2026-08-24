const User = require('../models/User');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Notification = require('../models/Notification');
const PendingRegistration = require('../models/PendingRegistration');
const mailer = require('../utils/mailer');
const { notifyUsers } = require('../utils/notify');
const { normalizeEmail, isDuplicateEmailError } = require('../utils/email');

const sendApprovalEmail = mailer.sendApprovalEmail || mailer.sendApprovalEmail;

const listUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status === 'active') {
      filter.isActive = true;
      filter.isApproved = true;
    }
    if (status === 'inactive') filter.isActive = false;
    if (status === 'pending') {
      filter.isApproved = false;
      filter.role = filter.role || { $in: ['student', 'teacher'] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load users. Please try again.' });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load user. Please try again.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, department, semester, batch } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const existingUser = await User.findOne({ email: normalizeEmail(email) });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: normalizeEmail(email),
      password,
      role,
      phone,
      department,
      semester,
      batch,
      studentId: role === 'student' ? `STU${Date.now().toString().slice(-8)}` : '',
      employeeId: role === 'teacher' ? `TCH${Date.now().toString().slice(-8)}` : '',
      enrollmentDate: role === 'student' ? new Date() : undefined,
      isEmailVerified: true,
      isApproved: true,
      isActive: true,
    });

    res.status(201).json(user);
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Unable to create user. Please try again.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const fields = [
      'name',
      'phone',
      'dateOfBirth',
      'address',
      'department',
      'semester',
      'batch',
      'isActive',
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update user. Please try again.' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });
    }

    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update user status. Please try again.' });
  }
};

const setApproval = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts do not require approval.' });
    }

    const approved = req.body.approved !== false;

    if (!approved) {
      await User.findByIdAndDelete(user._id);
      sendApprovalEmail(user.email, user.name, false).catch((error) => console.error(error));
      return res.json({ message: 'Registration declined and removed.', deleted: true });
    }

    user.isApproved = true;
    user.isActive = true;
    await user.save();

    await notifyUsers([user._id], {
      title: 'Account approved',
      message: 'An administrator approved your account. You can now log in to EduTrack.',
      type: 'announcement',
      link: '/login',
    });

    sendApprovalEmail(user.email, user.name, true).catch((error) => console.error(error));

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update approval. Please try again.' });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be deleted from here.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    if (user.role === 'teacher') {
      const courseCount = await Course.countDocuments({ teacher: user._id });
      if (courseCount > 0) {
        return res.status(400).json({
          message: 'This teacher still has courses. Reassign or delete those courses first, then delete the account.',
        });
      }
    }

    await Course.updateMany({ students: user._id }, { $pull: { students: user._id } });
    await Submission.deleteMany({ student: user._id });
    await Attendance.deleteMany({ student: user._id });
    await Result.deleteMany({ student: user._id });
    await Notification.deleteMany({ user: user._id });
    await PendingRegistration.deleteOne({ email: user.email });
    await User.findByIdAndDelete(user._id);

    res.json({
      message: 'Account deleted. That Gmail can register again.',
      deleted: true,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to delete user. Please try again.' });
  }
};

module.exports = { listUsers, getUser, createUser, updateUser, toggleUserStatus, setApproval, deleteUser };
