// facebook-server/src/models/user.js
const sql = require('../config/db');

class User {
  static async findById(id) {
    if (!id) throw new Error('User ID is required');
    try {
      const result = await sql`
        SELECT id, google_id, username, email, avatar
        FROM users
        WHERE id = ${id}
      `;
      console.log('Found user by id:', result[0]);
      return result[0];
    } catch (err) {
      console.error('Find by id error:', { message: err.message, stack: err.stack, id });
      throw new Error(`Failed to find user by id: ${err.message}`);
    }
  }

  static async findByGoogleId(googleId) {
    if (!googleId) throw new Error('Google ID is required');
    try {
      const result = await sql`
        SELECT id, google_id, username, email, avatar
        FROM users
        WHERE google_id = ${googleId}
      `;
      return result[0];
    } catch (err) {
      console.error('Find by google id error:', { message: err.message, stack: err.stack, googleId });
      throw new Error(`Failed to find user by google id: ${err.message}`);
    }
  }

  static async findByEmail(email) {
    if (!email) throw new Error('Email is required');
    try {
      const result = await sql`
        SELECT id, google_id, username, email, avatar
        FROM users
        WHERE email = ${email}
      `;
      return result[0];
    } catch (err) {
      console.error('Find by email error:', { message: err.message, stack: err.stack, email });
      throw new Error(`Failed to find user by email: ${err.message}`);
    }
  }

  static async create({ googleId, username, email, avatar }) {
    if (!googleId || !username || !email) {
      throw new Error('Google ID, username, and email are required');
    }
    try {
      const result = await sql`
        INSERT INTO users (google_id, username, email, avatar)
        VALUES (${googleId}, ${username}, ${email}, ${avatar})
        ON CONFLICT (google_id) DO UPDATE
        SET username = EXCLUDED.username, email = EXCLUDED.email, avatar = EXCLUDED.avatar
        RETURNING id, google_id, username, email, avatar
      `;
      return result[0];
    } catch (err) {
      console.error('Create user error:', { message: err.message, stack: err.stack, googleId, email });
      throw new Error(`Failed to create user: ${err.message}`);
    }
  }

  static async findByTextSearchQuery(query, params) {
    try {
      const result = await sql.unsafe(query, params);
      return result;
    } catch (err) {
      console.error('Search users error:', { message: err.message, stack: err.stack, query, params });
      throw new Error(`Failed to search users: ${err.message}`);
    }
  }

  static async getAllUsersQuery() {
    try {
      const result = await sql`
        SELECT id, username, email, avatar
        FROM users
        ORDER BY username ASC
      `;
      return result;
    } catch (err) {
      console.error('Get all users error:', { message: err.message, stack: err.stack });
      throw new Error(`Failed to get all users: ${err.message}`);
    }
  }
}

module.exports = User;