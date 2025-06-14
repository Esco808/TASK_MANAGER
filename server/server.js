const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;
const SECRET = 'kanban-secret';
const { body, validationResult } = require('express-validator');

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (key.startsWith('$') || key.includes('.')) {
        delete req.body[key];
      }
    }
  }
  next();
});


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

app.post('/api/register', [
  body('username')
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nazwa użytkownika musi mieć min. 3 znaki'),

  body('password')
    .isString()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Hasło musi mieć min. 5 znaków')
], async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'Użytkownik już istnieje' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.status(201).json({ message: 'Zarejestrowano pomyślnie' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});


app.post('/api/login', [
  body('username')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Nazwa użytkownika jest wymagana'),

  body('password')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Hasło jest wymagane')
], async (req, res) => {
  // Sprawdzenie błędów walidacji
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const token = jwt.sign({ id: user._id }, 'tajny_klucz', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});


app.get('/api/boards', authenticateToken, async (req, res) => {
  const boards = await Board.find({ owner: req.user.id });
  res.json(boards);
});

app.post(
  '/api/boards',
  authenticateToken,
  [
    body('name')
      .isString()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Nazwa tablicy musi mieć co najmniej 3 znaki')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const board = new Board({ name: req.body.name, owner: req.user.id });
      await board.save();
      res.status(201).json(board);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera przy tworzeniu tablicy' });
    }
  }
);



app.get('/api/tasks/:boardId', authenticateToken, async (req, res) => {
  const tasks = await Task.find({ boardId: req.params.boardId });
  res.json(tasks);
});

app.put(
  '/api/boards/:id',
  authenticateToken,
  [
    body('name')
      .isString()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Nazwa tablicy musi mieć co najmniej 3 znaki')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const board = await Board.findOneAndUpdate(
        { _id: req.params.id, owner: req.user.id },
        { name: req.body.name },
        { new: true }
      );
      if (!board) return res.status(404).json({ error: 'Tablica nie znaleziona' });
      res.json(board);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera przy edycji tablicy' });
    }
  }
);


app.delete('/api/boards/:id', authenticateToken, async (req, res) => {
  await Task.deleteMany({ boardId: req.params.id });
  await Board.deleteOne({ _id: req.params.id, owner: req.user.id });
  res.sendStatus(204);
});

app.post(
  '/api/tasks',
  authenticateToken,
  [
    body('title')
      .isString()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Tytuł musi mieć co najmniej 3 znaki'),

    body('description')
      .isString()
      .trim()
      .isLength({ min: 5 })
      .withMessage('Opis musi mieć co najmniej 5 znaków'),

    body('status')
      .isIn(['TO DO', 'IN PROGRESS', 'DONE'])
      .withMessage('Status musi być: todo, in-progress lub done'),

    body('boardId')
      .isMongoId()
      .withMessage('Nieprawidłowy ID tablicy')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = new Task(req.body);
      await task.save();
      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera przy tworzeniu zadania' });
    }
  }
);

app.put(
  '/api/tasks/:id',
  authenticateToken,
  [
    body('title')
      .isString()
      .trim()
      .isLength({ min: 3 }),

    body('description')
      .isString()
      .trim()
      .isLength({ min: 5 }),

    body('status')
      .isIn(['TO DO', 'IN PROGRESS', 'DONE'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!task) return res.status(404).json({ error: 'Zadanie nie znalezione' });
      res.json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Błąd serwera przy edycji zadania' });
    }
  }
);

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
