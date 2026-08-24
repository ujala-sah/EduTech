const express = require('express');
const {
  submitAssignment,
  getSubmissions,
  listTeacherSubmissions,
  gradeSubmission,
} = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', authorizeRoles('teacher', 'admin'), listTeacherSubmissions);
router.post('/', authorizeRoles('student'), upload.single('file'), submitAssignment);
router.get('/:assignmentId', authorizeRoles('teacher', 'admin'), getSubmissions);
router.put('/:id/grade', authorizeRoles('teacher', 'admin'), gradeSubmission);

module.exports = router;
