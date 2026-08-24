const Notification = require('../models/Notification');

async function notifyUsers(userIds, { title, message, type, link }) {
  const uniqueIds = [...new Set(userIds.filter(Boolean).map((id) => id.toString()))];
  if (!uniqueIds.length) return;

  await Notification.insertMany(
    uniqueIds.map((user) => ({
      user,
      title,
      message,
      type,
      link: link || '',
    }))
  );
}

module.exports = { notifyUsers };
