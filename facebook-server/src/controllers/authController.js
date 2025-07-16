// facebook-server/src/controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const passport = require('passport');

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_CALLBACK_URL,
});

exports.googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

exports.googleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    const accessToken = tokens.access_token;

    // Fetch user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }
    const userInfo = await response.json();
    console.log('User Info:', userInfo);

    if (!userInfo.email || !userInfo.id) {
      return res.status(401).json({ error: 'Missing required user info: email or ID' });
    }

    // Find or create user
    let user = await User.findByGoogleId(userInfo.id);
    if (!user) {
      user = await User.create({
        googleId: userInfo.id,
        username: userInfo.name || `user_${Date.now()}`,
        email: userInfo.email,
        avatar: userInfo.picture || null,
      });
      if (!user) {
        return res.status(500).json({ error: 'Failed to create user' });
      }
    }
    console.log('User:', user);

    // Generate JWT
    const token = jwt.sign(
      {
        username: user.username,
        email: user.email,
        google_id: user.google_id,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Redirect to frontend
    const successURL = `${process.env.FRONTEND_URL}/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
    res.redirect(302, successURL);
  } catch (err) {
    console.error('Google callback error:', { message: err.message, stack: err.stack });
    res.status(500).json({ error: `Authentication failed: ${err.message}` });
  }
};

module.exports = exports;