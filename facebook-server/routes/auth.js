const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;