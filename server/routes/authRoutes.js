const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
  body('username').isString().trim().isLength({ min: 3 }),
  body('password').isString().trim().isLength({ min: 5 })
], register);

router.post('/login', [
  body('username').isString().trim().notEmpty(),
  body('password').isString().trim().notEmpty()
], login);

module.exports = router;
