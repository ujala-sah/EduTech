const express = require('express');
const { listResults, createResult, deleteResult } = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listResults);
router.post('/', authorizeRoles('teacher', 'admin'), createResult);
router.delete('/:id', authorizeRoles('teacher', 'admin'), deleteResult);

module.exports = router;
