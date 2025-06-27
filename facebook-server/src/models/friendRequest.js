// facebook-server/src/models/friendRequest.js
const sql = require('../config/db');

class FriendRequest {
  static async create(senderId, receiverId) {
    if (!senderId) throw new Error('Sender ID is required');
    if (!receiverId) throw new Error('Receiver ID is required');
    if (senderId === receiverId) throw new Error('Cannot send friend request to oneself');
    try {
      const result = await sql`
        INSERT INTO friend_requests (sender_id, receiver_id)
        VALUES (${senderId}, ${receiverId})
        ON CONFLICT (sender_id, receiver_id) DO NOTHING
        RETURNING id, sender_id, receiver_id, status, created_at, updated_at
      `;
      if (!result || result.length === 0) {
        throw new Error('Friend request already exists or failed to create');
      }
      console.log('Created friend request:', result[0]);
      return result[0];
    } catch (err) {
      console.error('Friend request create error:', { message: err.message, stack: err.stack, senderId, receiverId });
      throw new Error(`Failed to create friend request: ${err.message}`);
    }
  }

  static async findPending(receiverId) {
    if (!receiverId) throw new Error('Receiver ID is required');
    try {
      const result = await sql`
        SELECT fr.id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at, fr.updated_at, u.id AS sender_user_id, u.username, u.avatar, u.email
        FROM friend_requests fr
        JOIN users u ON fr.sender_id = u.id
        WHERE fr.receiver_id = ${receiverId} AND fr.status = 'pending'
        ORDER BY fr.created_at DESC
      `;
      console.log('Found pending friend requests:', result);
      return result;
    } catch (err) {
      console.error('Find pending friend requests error:', { message: err.message, stack: err.stack, receiverId });
      throw new Error(`Failed to find pending friend requests: ${err.message}`);
    }
  }

  static async updateStatus(id, status) {
    if (!id) throw new Error('Friend request ID is required');
    if (!status) throw new Error('Status is required');
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      throw new Error('Invalid status: must be pending, accepted, or rejected');
    }
    try {
      const result = await sql`
        UPDATE friend_requests
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, sender_id, receiver_id, status, created_at, updated_at
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to update friend request: request not found');
      }
      console.log('Updated friend request:', result[0]);
      return result[0];
    } catch (err) {
      console.error('Friend request update error:', { message: err.message, stack: err.stack, id, status });
      throw new Error(`Failed to update friend request: ${err.message}`);
    }
  }
}

module.exports = FriendRequest;