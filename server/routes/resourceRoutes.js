const express = require('express');
const { listResources, createResource, deleteResource } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listResources);
router.post('/', authorizeRoles('teacher', 'admin'), upload.single('file'), createResource);
router.delete('/:id', authorizeRoles('teacher', 'admin'), deleteResource);

module.exports = router;
