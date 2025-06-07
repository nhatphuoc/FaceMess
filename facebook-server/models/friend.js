const pool = require('../config/db');

const Friend = {
  async create(userId, friendId) {
    await pool.query(
      'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, friendId]
    );
  },
  async check(userId, friendId) {
    const result = await pool.query(
      'SELECT EXISTS (SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2) AS is_friend',
      [userId, friendId]
    );
    return result.rows[0].is_friend;
  }
};

module.exports = Friend;