const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.get('/:boardId', auth, getTasks);

router.post('/', auth, [
  body('title').isString().trim().isLength({ min: 3 }),
  body('description').isString().trim().isLength({ min: 5 }),
  body('status').isIn(['TO DO', 'IN PROGRESS', 'DONE']),
  body('boardId').isMongoId()
], createTask);

router.put('/:id', auth, [
  body('title').isString().trim().isLength({ min: 3 }),
  body('description').isString().trim().isLength({ min: 5 }),
  body('status').isIn(['TO DO', 'IN PROGRESS', 'DONE'])
], updateTask);

router.delete('/:id', auth, deleteTask);

module.exports = router;
