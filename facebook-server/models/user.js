const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  async create({ username, email, password, googleId, avatar }) {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const result = await pool.query(
      'INSERT INTO users (username, email, password, google_id, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, email, hashedPassword, googleId, avatar]
    );
    return result.rows[0];
  }
};

module.exports = User;