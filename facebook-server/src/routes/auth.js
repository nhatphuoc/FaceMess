// facebook-server/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/google', authController.googleLogin);
router.get('/callback/google', authController.googleCallback);

module.exports = router;