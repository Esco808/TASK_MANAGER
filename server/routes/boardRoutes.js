const express = require('express');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const { getBoards, createBoard, updateBoard, deleteBoard } = require('../controllers/boardController');

const router = express.Router();

router.get('/', authenticateToken, getBoards);

router.post('/', authenticateToken, [
  body('name').isString().trim().isLength({ min: 3 })
], createBoard);

router.put('/:id', authenticateToken, [
  body('name').isString().trim().isLength({ min: 3 })
], updateBoard);

router.delete('/:id', authenticateToken, deleteBoard);

module.exports = router;
