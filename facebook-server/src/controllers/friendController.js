// facebook-server/src/controllers/friendController.js
const Friend = require('../models/friend');
const FriendRequest = require('../models/friendRequest');
const User = require('../models/user');
const sql = require('../config/db');

exports.sendFriendRequest = async (req, res) => {
  try {
    const { friendEmail } = req.body;
    const senderId = req.user.id;
    if (!friendEmail) {
      return res.status(400).json({ error: 'Friend email is required' });
    }
    if (friendEmail === req.user.email) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const friend = await User.findByEmail(friendEmail);
    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Kiểm tra xem đã gửi hoặc nhận yêu cầu chưa
    const existingSent = await FriendRequest.findPending(friend.id);
    if (existingSent.some(req => req.sender_id === senderId)) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }
    const existingReceived = await FriendRequest.findPending(senderId);
    if (existingReceived.some(req => req.sender_id === friend.id)) {
      return res.status(400).json({ error: 'You have a pending request from this user' });
    }

    // Kiểm tra xem đã là bạn bè chưa
    const friends = await Friend.findFriends(senderId);
    if (friends.some(f => f.id === friend.id)) {
      return res.status(400).json({ error: 'You are already friends' });
    }

    const request = await FriendRequest.create(senderId, friend.id);
    res.status(201).json({ success: 'Friend request sent', request });
  } catch (err) {
    console.error('Send friend request error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to send friend request: ${err.message}` });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    const request = await FriendRequest.findPending(req.user.id);
    const targetRequest = request.find(r => r.id === parseInt(requestId));
    if (!targetRequest) {
      return res.status(404).json({ error: 'Friend request not found or not pending' });
    }

    await FriendRequest.updateStatus(requestId, 'accepted');
    await Friend.create(req.user.id, targetRequest.sender_id);
    res.json({ success: 'Friend request accepted' });
  } catch (err) {
    console.error('Accept friend request error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to accept friend request: ${err.message}` });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    const request = await FriendRequest.findPending(req.user.id);
    if (!request.find(r => r.id === parseInt(requestId))) {
      return res.status(404).json({ error: 'Friend request not found or not pending' });
    }

    await FriendRequest.updateStatus(requestId, 'rejected');
    res.json({ success: 'Friend request rejected' });
  } catch (err) {
    console.error('Reject friend request error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to reject friend request: ${err.message}` });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const friends = await Friend.findFriends(req.user.id);
    res.json(friends);
  } catch (err) {
    console.error('Get friends error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to fetch friends: ${err.message}` });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    console.log('User ID:', req.user.id); // Thêm log
    const requests = await FriendRequest.findPending(req.user.id);
    res.json(requests);
  } catch (err) {
    console.error('Get pending requests error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to fetch pending requests: ${err.message}` });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const result = await sql`
      SELECT fr.id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at, fr.updated_at, u.id AS receiver_user_id, u.username, u.avatar, u.email
      FROM friend_requests fr
      JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = ${req.user.id}
      ORDER BY fr.created_at DESC
    `;
    console.log('Found sent friend requests:', result);
    res.json(result);
  } catch (err) {
    console.error('Get sent requests error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Failed to fetch sent requests: ${err.message}` });
  }
};