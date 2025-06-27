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
    // Kiểm tra kết nối
    await sql`SELECT 1`;
    console.log('Database connected successfully');

    // Tạo bảng users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        avatar TEXT
      );
    `;

    // Tạo bảng friends
    await sql`
      CREATE TABLE IF NOT EXISTS friends (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, friend_id)
      );
    `;

    // Tạo bảng friend_requests
    await sql`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        CONSTRAINT unique_sender_receiver UNIQUE (sender_id, receiver_id)
      );
    `;

    // Tạo bảng posts
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Tạo chỉ mục
    await sql`
      CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_id ON friend_requests(sender_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    `;

    console.log('Database schema initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', { message: err.message, stack: err.stack });
    process.exit(1);
  }
}

// Khởi tạo database khi module được load
initializeDatabase();

module.exports = sql;