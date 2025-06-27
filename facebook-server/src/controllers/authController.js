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
  session: false
});

exports.googleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    // Trao đổi mã code để lấy token
    const { tokens } = await client.getToken(code);
    const accessToken = tokens.access_token;

    // Lấy thông tin người dùng từ Google
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = await response.json();

    console.log('User Info:', userInfo); 

    if (!userInfo.email || !userInfo.id) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Tìm hoặc tạo user trong cơ sở dữ liệu
    let user;
    try {
      user = await User.findByGoogleId(userInfo.id);
    console.log('User Info1:', user); 

      if (!user) {
        user = await User.create({
          googleId: userInfo.id,
          username: userInfo.name || userInfo.email || 'Unknown User',
          email: userInfo.email || '',
          avatar: userInfo.picture || '',
        });
        if (!user) {
          return res.status(500).json({ error: 'Failed to create user' });
        }
      }

    console.log('User Info2:', user); 

    } catch (err) {
      console.error('Error processing user:', err);
      return res.status(500).json({ error: 'Error findByGoogleId user' });
    }

    // Tạo JWT token
    const token = jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      googleId: user.googleId,
      avatar: user.avatar,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 giờ
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    }, process.env.JWT_SECRET);

    const successURL = `http://localhost:3000/login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
    res.redirect(302, successURL); // Chuyển hướng với status 302 (Temporary Redirect)
  } catch (err) {
    console.error('Error in Google Callback:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};