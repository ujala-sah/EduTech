const Notification = require('../models/Notification');
const User = require('../models/User');
const Course = require('../models/Course');
const { notifyUsers } = require('../utils/notify');

const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((item) => !item.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load notifications. Please try again.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update notification. Please try again.' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update notifications. Please try again.' });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { title, message, type, course, audience } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    let recipients = [];

    if (req.user.role === 'admin' && audience === 'all') {
      const users = await User.find({ isActive: true, role: { $ne: 'admin' } }).select('_id');
      recipients = users.map((user) => user._id);
    } else if (course) {
      const courseDoc = await Course.findById(course);
      if (!courseDoc) return res.status(404).json({ message: 'Course not found.' });

      if (req.user.role === 'teacher' && courseDoc.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }

      recipients = courseDoc.students;
    } else if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user._id });
      recipients = courses.flatMap((item) => item.students);
    } else {
      return res.status(400).json({ message: 'Please choose a course or audience.' });
    }

    await notifyUsers(recipients, {
      title,
      message,
      type: type || 'announcement',
      link: '/notifications',
    });

    res.status(201).json({ message: 'Notification sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to send notification. Please try again.' });
  }
};

module.exports = { listNotifications, markAsRead, markAllRead, sendNotification };
