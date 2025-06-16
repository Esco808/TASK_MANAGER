const express = require('express');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  getAllUsers,
  deleteUser,
  updateUserRole
} = require('../controllers/adminController');

const router = express.Router();

// Tylko admin i moderator widzą listę użytkowników
router.get('/users', authenticateToken, authorizeRoles('admin', 'moderator'), getAllUsers);

// Admin i moderator mogą usuwać użytkowników
router.delete('/users/:id', authenticateToken, authorizeRoles('admin', 'moderator'), deleteUser);

// Tylko admin może nadawać role
router.put('/users/:id/role', authenticateToken, authorizeRoles('admin'), [
  body('role').isIn(['admin', 'moderator', 'user'])
], updateUserRole);

module.exports = router;
