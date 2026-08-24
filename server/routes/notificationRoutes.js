const express = require('express');
const {
  listNotifications,
  markAsRead,
  markAllRead,
  sendNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markAsRead);
router.post('/', authorizeRoles('teacher', 'admin'), sendNotification);

module.exports = router;
