// facebook-server/src/routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, userController.getCurrentUser);
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getProfile);
router.get('/search', authMiddleware, (req, res) => {
  const { query, exclude } = req.query;
  if (!query && !exclude) {
    return res.status(400).json({ error: 'Query or exclude parameter is required' });
  }
  if (exclude) {
    friendController.findFriends(exclude)
      .then(friends => {
        const friendEmails = friends.map(f => f.email);
        return userController.findByTextSearchQuery(
          'SELECT id, username, email, avatar FROM users WHERE email != $1 AND email NOT IN ($2)',
          [exclude, friendEmails.length ? friendEmails.join(',') : '']
        );
      })
      .then(users => res.json(users))
      .catch(err => res.status(500).json({ error: `Failed to fetch users: ${err.message}` }));
  } else {
    userController.searchUsers(req, res);
  }
});

module.exports = router;