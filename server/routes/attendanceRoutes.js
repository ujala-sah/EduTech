const express = require('express');
const { markAttendance, getAttendance, getAttendanceSummary } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getAttendance);
router.get('/summary', getAttendanceSummary);
router.post('/', authorizeRoles('teacher', 'admin'), markAttendance);

module.exports = router;
