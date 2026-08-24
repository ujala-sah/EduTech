const express = require('express');
const { listMessages, markMessageRead } = require('../controllers/publicController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));
router.get('/', listMessages);
router.put('/:id/read', markMessageRead);

module.exports = router;
