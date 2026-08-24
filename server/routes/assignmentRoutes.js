const express = require('express');
const {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listAssignments);
router.get('/:id', getAssignment);
router.post('/', authorizeRoles('teacher', 'admin'), upload.single('attachment'), createAssignment);
router.put('/:id', authorizeRoles('teacher', 'admin'), upload.single('attachment'), updateAssignment);
router.delete('/:id', authorizeRoles('teacher', 'admin'), deleteAssignment);

module.exports = router;
