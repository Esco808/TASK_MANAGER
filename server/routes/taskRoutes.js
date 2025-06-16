const express = require('express');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.get('/:boardId', authenticateToken, getTasks);

router.post('/', authenticateToken, [
  body('title').isString().trim().isLength({ min: 3 }),
  body('description').isString().trim().isLength({ min: 5 }),
  body('status').isIn(['TO DO', 'IN PROGRESS', 'DONE']),
  body('boardId').isMongoId()
], createTask);

router.put('/:id', authenticateToken, [
  body('title').isString().trim().isLength({ min: 3 }),
  body('description').isString().trim().isLength({ min: 5 }),
  body('status').isIn(['TO DO', 'IN PROGRESS', 'DONE'])
], updateTask);

router.delete('/:id', authenticateToken, deleteTask);

module.exports = router;
