// facebook-server/src/routes/friend.js
const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middleware/auth');

router.post('/requests', authMiddleware, friendController.sendFriendRequest);
router.post('/requests/:id/accept', authMiddleware, friendController.acceptFriendRequest);
router.post('/requests/:id/reject', authMiddleware, friendController.rejectFriendRequest);
router.get('/', authMiddleware, friendController.getFriends);
router.get('/requests', authMiddleware, friendController.getPendingRequests);
router.get('/friend-requests/sent', authMiddleware, friendController.getSentRequests);

module.exports = router;