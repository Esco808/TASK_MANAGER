const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const { getBoards, createBoard, updateBoard, deleteBoard } = require('../controllers/boardController');

const router = express.Router();

router.get('/', auth, getBoards);

router.post('/', auth, [
  body('name').isString().trim().isLength({ min: 3 })
], createBoard);

router.put('/:id', auth, [
  body('name').isString().trim().isLength({ min: 3 })
], updateBoard);

router.delete('/:id', auth, deleteBoard);

module.exports = router;
