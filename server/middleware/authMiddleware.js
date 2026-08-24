const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'You are not authorized to perform this action.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'You are not authorized to perform this action.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'You are not authorized to perform this action.' });
  }
};

module.exports = { protect };
