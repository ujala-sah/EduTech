const express = require('express');
const {
  getPublicStats,
  getPublicCourses,
  listBlogs,
  getBlog,
  searchPublic,
  sendContact,
} = require('../controllers/publicController');

const router = express.Router();

router.get('/stats', getPublicStats);
router.get('/courses', getPublicCourses);
router.get('/search', searchPublic);
router.get('/blogs', listBlogs);
router.get('/blogs/:slug', getBlog);
router.post('/contact', sendContact);

module.exports = router;
