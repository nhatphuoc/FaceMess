// facebook-server/src/models/post.js
const sql = require('../config/db');

class Post {
  static async create({ userId, content }) {
    if (!userId) throw new Error('User ID is required');
    if (!content) throw new Error('Content is required');
    try {
      const result = await sql`
        INSERT INTO posts (user_id, content)
        VALUES (${userId}, ${content})
        RETURNING id, user_id, content, created_at
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to create post: no rows returned');
      }
      console.log('Created post:', result[0]);
      return result[0];
    } catch (err) {
      console.error('Post create error:', { message: err.message, stack: err.stack, userId });
      throw new Error(`Failed to create post: ${err.message}`);
    }
  }

  static async findByUserId(userId) {
    if (!userId) throw new Error('User ID is required');
    try {
      const result = await sql`
        SELECT p.id, p.user_id, p.content, p.created_at, u.username, u.avatar
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ${userId}
        ORDER BY p.created_at DESC
      `;
      console.log('Found posts by userId:', result);
      return result;
    } catch (err) {
      console.error('Find posts by userId error:', { message: err.message, stack: err.stack, userId });
      throw new Error(`Failed to find posts: ${err.message}`);
    }
  }

  static async findById(id) {
    if (!id) throw new Error('Post ID is required');
    try {
      const result = await sql`
        SELECT p.id, p.user_id, p.content, p.created_at, u.username, u.avatar
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ${id}
      `;
      console.log('Found post by id:', result[0] || null);
      return result[0] || null;
    } catch (err) {
      console.error('Find post by id error:', { message: err.message, stack: err.stack, id });
      throw new Error(`Failed to find post: ${err.message}`);
    }
  }

  static async update(id, { content }) {
    if (!id) throw new Error('Post ID is required');
    if (!content) throw new Error('Content is required');
    try {
      const result = await sql`
        UPDATE posts
        SET content = ${content}
        WHERE id = ${id}
        RETURNING id, user_id, content, created_at
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to update post: no rows returned');
      }
      console.log('Updated post:', result[0]);
      return result[0];
    } catch (err) {
      console.error('Post update error:', { message: err.message, stack: err.stack, id });
      throw new Error(`Failed to update post: ${err.message}`);
    }
  }

  static async delete(id) {
    if (!id) throw new Error('Post ID is required');
    try {
      const result = await sql`
        DELETE FROM posts
        WHERE id = ${id}
        RETURNING id
      `;
      if (!result || result.length === 0) {
        throw new Error('Failed to delete post: no rows affected');
      }
      console.log('Deleted post:', result[0]);
      return result[0];
    } catch (err) {
      console.error('Post delete error:', { message: err.message, stack: err.stack, id });
      throw new Error(`Failed to delete post: ${err.message}`);
    }
  }
}

module.exports = Post;