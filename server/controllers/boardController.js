const Board = require('../models/Board');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

exports.getBoards = async (req, res) => {
  const boards = await Board.find({ owner: req.user.id });
  res.json(boards);
};

exports.createBoard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const board = new Board({ name: req.body.name, owner: req.user.id });
  await board.save();
  res.status(201).json(board);
};

exports.updateBoard = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const board = await Board.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { name: req.body.name },
    { new: true }
  );
  if (!board) return res.status(404).json({ error: 'Tablica nie znaleziona' });
  res.json(board);
};

exports.deleteBoard = async (req, res) => {
  await Task.deleteMany({ boardId: req.params.id });
  await Board.deleteOne({ _id: req.params.id, owner: req.user.id });
  res.sendStatus(204);
};
