const express = require('express');
const { sendOtp, resendOtp, verifyOtp, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register/send-otp', sendOtp);
router.post('/register/resend-otp', resendOtp);
router.post('/register/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePhoto'), updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
