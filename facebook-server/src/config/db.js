// facebook-server/src/config/db.js
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
  try {
    await sql`SELECT 1`;
    console.log('Database connected successfully');

    // Bảng người dùng
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        avatar TEXT
      );
    `;

    // Bảng bạn bè
    await sql`
      CREATE TABLE IF NOT EXISTS friends (
        sender_email TEXT REFERENCES users(email) ON DELETE CASCADE,
        receiver_email TEXT REFERENCES users(email) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        PRIMARY KEY (sender_email, receiver_email)
      );
    `;

    // Bảng bài viết
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Chỉ mục (optional, hiệu năng)
    await sql`
      CREATE INDEX IF NOT EXISTS idx_friends_sender_email ON friends(sender_email);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_friends_receiver_email ON friends(receiver_email);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    `;

    console.log('Database schema initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
}

initializeDatabase();
module.exports = sql;
