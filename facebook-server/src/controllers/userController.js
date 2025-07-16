// facebook-server/src/controllers/userController.js
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

exports.createUser = [
  body('googleId').notEmpty().withMessage('Google ID is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { googleId, username, email, avatar } = req.body;
      // Kiểm tra xem người dùng đã tồn tại chưa
      let user = await User.findByEmail(email);
      if (user) {
        return res.status(201).json(user); // Trả về thông tin người dùng hiện có
      }
      // Tạo người dùng mới
      user = await User.create({ googleId, username, email, avatar });
      res.status(201).json(user);
    } catch (err) {
      console.error('Create user error:', { message: err.message, stack: err.stack });
      res.status(500).json({ error: `Failed to create user: ${err.message}` });
    }
  },
];


exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get current user error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to fetch current user: ${err.message}` });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await User.findById(parseInt(userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', { message: err.message, stack: err.stack, userId: req.params.id });
    res.status(500).json({ error: `Failed to fetch profile: ${err.message}` });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const users = await User.findByTextSearchQuery(
      'SELECT id, username, email, avatar FROM users WHERE username ILIKE $1',
      [`%${query}%`]
    );
    res.json(users);
  } catch (err) {
    console.error('Search users error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to search users: ${err.message}` });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await User.getAllUsersQuery();
    console.log('Found all users:', result);
    res.json(result);
  } catch (err) {
    console.error('Get all users error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to fetch users: ${err.message}` });
  }
};

module.exports = exports;