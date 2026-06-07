// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('password').notEmpty().withMessage('Password required'),
], login);

router.get('/me', protect, getMe);
// router.post('/seed', seedUsers); // Only in development

module.exports = router;
