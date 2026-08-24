const express = require('express');
const { listExams, createExam, updateExam, deleteExam } = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listExams);
router.post('/', authorizeRoles('teacher', 'admin'), createExam);
router.put('/:id', authorizeRoles('teacher', 'admin'), updateExam);
router.delete('/:id', authorizeRoles('teacher', 'admin'), deleteExam);

module.exports = router;
