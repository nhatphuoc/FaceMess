// facebook-server/src/routes/post.js
const { Router } = require('express');
  const router = Router();
  const { createPost, getUserPosts, updatePost, deletePost } = require('../controllers/postController');
  const authMiddleware = require('../middleware/auth');
  const multer = require('multer');
  const { memoryStorage } = require('multer');
  const upload = multer({ storage: memoryStorage() });

  router.post('/', authMiddleware, upload.single('image'), createPost);
  router.get('/user/:userId', authMiddleware, getUserPosts);
  router.put('/:id', authMiddleware, upload.single('image'), updatePost);
  router.delete('/:id', authMiddleware, deletePost);

  module.exports = router;