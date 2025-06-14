const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;
const SECRET = 'kanban-secret';

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/kanban', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const BoardSchema = new mongoose.Schema({
  name: String,
  owner: mongoose.Schema.Types.ObjectId
});
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String, // todo, in-progress, done
  boardId: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model('User', UserSchema);
const Board = mongoose.model('Board', BoardSchema);
const Task = mongoose.model('Task', TaskSchema);

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Brak tokena JWT' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      console.error('Błąd JWT:', err.message);
      return res.status(403).json({ message: 'Nieprawidłowy token' });
    }
    req.user = user;
    next();
  });
}


app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await new User({ username, password: hashed }).save();
  res.sendStatus(201);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.sendStatus(403);
  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token });
});

app.get('/api/boards', authenticateToken, async (req, res) => {
  const boards = await Board.find({ owner: req.user.id });
  res.json(boards);
});

app.post('/api/boards', authenticateToken, async (req, res) => {
  const board = new Board({ name: req.body.name, owner: req.user.id });
  await board.save();
  res.status(201).json(board);
});

app.get('/api/tasks/:boardId', authenticateToken, async (req, res) => {
  const tasks = await Task.find({ boardId: req.params.boardId });
  res.json(tasks);
});

app.put('/api/boards/:id', authenticateToken, async (req, res) => {
  const updated = await Board.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { name: req.body.name },
    { new: true }
  );
  res.json(updated);
});

app.delete('/api/boards/:id', authenticateToken, async (req, res) => {
  await Task.deleteMany({ boardId: req.params.id });
  await Board.deleteOne({ _id: req.params.id, owner: req.user.id });
  res.sendStatus(204);
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
