// facebook-server/src/controllers/postController.js
const Post = require('../models/post');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

exports.createPost = [
  body('content').notEmpty().withMessage('Content is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Find user by email from JWT
      const user = await User.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const post = await Post.create({
        userId: user.id,
        content: req.body.content,
      });
      res.json(post);
    } catch (err) {
      console.error('Create post error:', { message: err.message, stack: err.stack });
      res.status(500).json({ error: `Failed to create post: ${err.message}` });
    }
  },
];

exports.getUserPosts = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const posts = await Post.findByUserId(userId);
    res.json(posts);
  } catch (err) {
    console.error('Get user posts error:', { message: err.message, stack: err.stack, userId: req.params.userId });
    res.status(500).json({ error: `Failed to fetch posts: ${err.message}` });
  }
};

exports.updatePost = [
  body('content').notEmpty().withMessage('Content is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const postId = parseInt(req.params.id);
      if (!postId || isNaN(postId)) {
        return res.status(400).json({ error: 'Invalid post ID' });
      }
      // Verify user owns the post
      const user = await User.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const post = await Post.findById(postId);
      if (!post || post.userId !== user.id) {
        return res.status(403).json({ error: 'Unauthorized to update this post' });
      }
      const updatedPost = await Post.update(postId, {
        content: req.body.content,
      });
      res.json(updatedPost);
    } catch (err) {
      console.error('Update post error:', { message: err.message, stack: err.stack, postId: req.params.id });
      res.status(500).json({ error: `Failed to update post: ${err.message}` });
    }
  },
];

exports.deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    if (!postId || isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    // Verify user owns the post
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const post = await Post.findById(postId);
    if (!post || post.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }
    await Post.delete(postId);
    res.json({ success: 'Post deleted' });
  } catch (err) {
    console.error('Delete post error:', { message: err.message, stack: err.stack, postId: req.params.id });
    res.status(500).json({ error: `Failed to delete post: ${err.message}` });
  }
};

module.exports = exports;