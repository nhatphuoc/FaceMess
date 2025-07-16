// facebook-server/src/controllers/friendController.js
const Friend = require('../models/friend');
const User = require('../models/user');

exports.sendFriendRequest = async (req, res) => {
  try {
    const { friendEmail } = req.body;
    const senderEmail = req.user.email;
    if (!friendEmail) {
      return res.status(400).json({ error: 'Friend email is required' });
    }
    if (friendEmail === senderEmail) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const friend = await User.findByEmail(friendEmail);
    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends or request exists
    const friends = await Friend.findFriends(senderEmail);
    if (friends.some((f) => f.email === friendEmail)) {
      return res.status(400).json({ error: 'You are already friends' });
    }
    const pendingRequests = await Friend.getPendingRequests(friendEmail);
    if (pendingRequests.some((req) => req.email === senderEmail)) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }
    const receivedRequests = await Friend.getPendingRequests(senderEmail);
    if (receivedRequests.some((req) => req.email === friendEmail)) {
      return res.status(400).json({ error: 'You have a pending request from this user' });
    }

    const request = await Friend.create(senderEmail, friendEmail);
    res.status(201).json({ success: 'Friend request sent', request });
  } catch (err) {
    console.error('Send friend request error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to send friend request: ${err.message}` });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { senderEmail } = req.body;
    const receiverEmail = req.user.email;
    if (!senderEmail) {
      return res.status(400).json({ error: 'Sender email is required' });
    }

    const pendingRequests = await Friend.getPendingRequests(receiverEmail);
    const targetRequest = pendingRequests.find((r) => r.email === senderEmail);
    if (!targetRequest) {
      return res.status(404).json({ error: 'Friend request not found or not pending' });
    }

    await Friend.updateStatus(senderEmail, receiverEmail, 'accepted');
    res.json({ success: 'Friend request accepted' });
  } catch (err) {
    console.error('Accept friend request error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to accept friend request: ${err.message}` });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const { senderEmail } = req.body;
    const receiverEmail = req.user.email;
    if (!senderEmail) {
      return res.status(400).json({ error: 'Sender email is required' });
    }

    const pendingRequests = await Friend.getPendingRequests(receiverEmail);
    if (!pendingRequests.find((r) => r.email === senderEmail)) {
      return res.status(404).json({ error: 'Friend request not found or not pending' });
    }

    await Friend.updateStatus(senderEmail, receiverEmail, 'rejected');
    res.json({ success: 'Friend request rejected' });
  } catch (err) {
    console.error('Reject friend request error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to reject friend request: ${err.message}` });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const friends = await Friend.findFriends(req.user.email);
    res.json(friends);
  } catch (err) {
    console.error('Get friends error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to fetch friends: ${err.message}` });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Friend.getPendingRequests(req.user.email);
    res.json(requests);
  } catch (err) {
    console.error('Get pending requests error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to fetch pending requests: ${err.message}` });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const requests = await Friend.getSentRequests(req.user.email);
    res.json(requests);
  } catch (err) {
    console.error('Get sent requests error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to fetch sent requests: ${err.message}` });
  }
};

module.exports = exports;