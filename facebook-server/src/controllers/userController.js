// facebook-server/src/controllers/userController.js
const User = require('../models/user');

exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = await User.findById(userId);
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
    const { query } = req.query; // Sửa lỗi: lấy query từ req.query
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