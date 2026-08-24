const express = require('express');
const { listUsers, getUser, createUser, updateUser, toggleUserStatus, setApproval, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));
router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);
router.patch('/:id/approval', setApproval);
router.delete('/:id', deleteUser);

module.exports = router;
