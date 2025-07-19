// facebook-server/src/models/friend.js
const sql = require('../config/db');

class Friend {
  static async create(senderEmail, receiverEmail) {
    if (!senderEmail) throw new Error('Sender email is required');
    if (!receiverEmail) throw new Error('Receiver email is required');
    if (senderEmail === receiverEmail) throw new Error('Cannot add self as friend');
    try {
      const result = await sql`
        INSERT INTO friends (sender_email, receiver_email, status)
        VALUES (${senderEmail}, ${receiverEmail}, 'pending')
        ON CONFLICT (sender_email, receiver_email) DO NOTHING
        RETURNING sender_email, receiver_email, status, created_at
      `;
      if (!result || result.length === 0) {
        throw new Error('Friend request already exists or failed to create');
      }
      console.log('Created friend request:', result[0]);
      return result[0];
    } catch (err) {
      console.error('Friend create error:', { message: err.message, stack: err.stack, senderEmail, receiverEmail });
      throw new Error(`Failed to create friend request: ${err.message}`);
    }
  }

  static async findFriends(userEmail) {
    if (!userEmail) throw new Error('User email is required');
    try {
      const result = await sql`
        SELECT u.id, u.username, u.email, u.avatar, u.google_id
        FROM friends f
        JOIN users u ON f.receiver_email = u.email
        WHERE f.sender_email = ${userEmail} AND f.status = 'accepted'
        UNION
        SELECT u.id, u.username, u.email, u.avatar, u.google_id
        FROM friends f
        JOIN users u ON f.sender_email = u.email
        WHERE f.receiver_email = ${userEmail} AND f.status = 'accepted'
        ORDER BY username ASC
      `;
      console.log('Found friends:', result);
      return result;
    } catch (err) {
      console.error('Find friends error:', { message: err.message, stack: err.stack, userEmail });
      throw new Error(`Failed to find friends: ${err.message}`);
    }
  }

  static async updateStatus(senderEmail, receiverEmail, status) {
    if (!senderEmail) throw new Error('Sender email is required');
    if (!receiverEmail) throw new Error('Receiver email is required');
    if (!['accepted', 'rejected'].includes(status)) throw new Error('Invalid status');
    try {
      const result = await sql`
        UPDATE friends
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        WHERE sender_email = ${senderEmail} AND receiver_email = ${receiverEmail}
        RETURNING sender_email, receiver_email, status, updated_at
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to update friend request: no rows affected');
      }
      console.log('Updated friend request:', result[0]);
      return result[0];
    } catch (err) {
      console.error('Update friend status error:', { message: err.message, stack: err.stack, senderEmail, receiverEmail });
      throw new Error(`Failed to update friend request: ${err.message}`);
    }
  }

  static async getPendingRequests(receiverEmail) {
    if (!receiverEmail) throw new Error('Receiver email is required');
    try {
      const result = await sql`
        SELECT u.id, u.username, u.email, u.avatar, f.created_at
        FROM friends f
        JOIN users u ON f.sender_email = u.email
        WHERE f.receiver_email = ${receiverEmail} AND f.status = 'pending'
        ORDER BY f.created_at DESC
      `;
      console.log('Found pending friend requests:', result);
      return result;
    } catch (err) {
      console.error('Get pending requests error:', { message: err.message, stack: err.stack, receiverEmail });
      throw new Error(`Failed to get pending requests: ${err.message}`);
    }
  }

  static async getSentRequests(senderEmail) {
    if (!senderEmail) throw new Error('Sender email is required');
    try {
      const result = await sql`
        SELECT u.id, u.username, u.email, u.avatar, f.created_at
        FROM friends f
        JOIN users u ON f.receiver_email = u.email
        WHERE f.sender_email = ${senderEmail} AND f.status = 'pending'
        ORDER BY f.created_at DESC
      `;
      console.log('Found sent friend requests:', result);
      return result;
    } catch (err) {
      console.error('Get sent requests error:', { message: err.message, stack: err.stack, senderEmail });
      throw new Error(`Failed to get sent requests: ${err.message}`);
    }
  }
}

module.exports = Friend;