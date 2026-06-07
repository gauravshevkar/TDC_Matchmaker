// controllers/authController.js
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * JWT Token generate karo
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Login matchmaker
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    // Validation errors check karo
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    // User dhundho (password bhi chahiye)
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Password check karo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Last login update karo
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Current logged in user ka data
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed default matchmaker accounts (development only)
 * @route   POST /api/auth/seed
 * @access  Public (only in development)
 */
// const seedUsers = async (req, res, next) => {
//   try {
//     if (process.env.NODE_ENV !== 'development') {
//       return res.status(403).json({ success: false, message: 'Not allowed in production' });
//     }

    // Check karo existing users hain ya nahi
    const existing = await User.findOne({ username: 'matchmaker1' });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Users already seeded',
        credentials: [
          { username: 'matchmaker1', password: 'TDC@2024' },
          { username: 'matchmaker2', password: 'TDC@2024' },
        ],
      });
    }

    // Sirf matchmaker accounts — no admin role
    const users = [
      {
        username: 'matchmaker1',
        email: 'priya@tdc.com',
        password: 'TDC@2024',
        fullName: 'Priya Sharma',
      },
      {
        username: 'matchmaker2',
        email: 'rahul@tdc.com',
        password: 'TDC@2024',
        fullName: 'Rahul Mehta',
      },
    ];

    for (const userData of users) {
      await User.create(userData);
    }

    res.status(201).json({
      success: true,
      message: 'Matchmaker accounts created',
      credentials: [
        { username: 'matchmaker1', password: 'TDC@2024' },
        { username: 'matchmaker2', password: 'TDC@2024' },
      ],
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe };
