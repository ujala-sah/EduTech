const express = require('express');
const {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listCourses);
router.get('/:id', getCourse);
router.post('/', authorizeRoles('admin'), createCourse);
router.put('/:id', authorizeRoles('admin'), updateCourse);
router.delete('/:id', authorizeRoles('admin'), deleteCourse);

module.exports = router;
