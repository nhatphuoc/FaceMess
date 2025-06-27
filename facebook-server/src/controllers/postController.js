// facebook-server/src/controllers/postController.js
const Post = require('../models/post');
const cloudinary = require('../services/cloudinary');
const { body, validationResult } = require('express-validator');

exports.createPost = [
  body('content').notEmpty().withMessage('Content is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      let imageUrl = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
      }

      const post = await Post.create({
        userId: req.user.id,
        content: req.body.content,
        imageUrl
      });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
];

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.findByUserId(req.params.userId);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePost = [
  body('content').notEmpty().withMessage('Content is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      let imageUrl = req.body.imageUrl;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
      }

      const post = await Post.update(req.params.id, {
        content: req.body.content,
        imageUrl
      });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
];

exports.deletePost = async (req, res) => {
  try {
    await Post.delete(req.params.id);
    res.json({ success: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};