const User = require('../models/User');
const Board = require('../models/Board');
const Task = require('../models/Task');

exports.getAllUsers = async (req, res) => {
  const users = await User.find({}, 'username role');
  res.json(users);
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  // Usuń zadania i tablice użytkownika
  const boards = await Board.find({ owner: userId });
  const boardIds = boards.map(b => b._id);

  await Task.deleteMany({ boardId: { $in: boardIds } });
  await Board.deleteMany({ owner: userId });
  await User.findByIdAndDelete(userId);

  res.json({ message: 'Użytkownik i jego dane zostały usunięte' });
};

exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
  res.json(user);
};
