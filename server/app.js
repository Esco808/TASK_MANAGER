const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban';

mongoose.connect(DB_URI)
  .then(() => {
    console.info(`Connected to MongoDB at ${DB_URI}`);
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

app.use('/api', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

app.get('/keep-alive', (req, res) => {
  res.status(200).send('OK');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Nie znaleziono zasobu' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Wartość musi być unikalna' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Błąd walidacji', details: err.errors });
  }

  console.error(err);
  res.status(status).json({ error: err.message || 'Błąd serwera' });
});

module.exports = app;
