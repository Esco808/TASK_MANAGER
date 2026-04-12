const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw httpError(400, 'Niepoprawne dane wejściowe');
  }

  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) {
    throw httpError(409, 'Użytkownik już istnieje');
  }

  const hashed = await bcrypt.hash(password, 10);
  await new User({ username, password: hashed, role: 'user' }).save();
  res.status(201).json({ message: 'Zarejestrowano pomyślnie' });
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw httpError(400, 'Niepoprawne dane wejściowe');
  }

  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError(401, 'Nieprawidłowe dane logowania');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
};
