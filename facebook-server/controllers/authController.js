const jwt = require('jsonwebtoken');
const User = require('../models/user');
const cloudinary = require('../utils/cloudinary');
const passport = require('passport');

const authController = {
  async googleLogin(req, res, next) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  },
  async googleCallback(req, res) {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) return res.status(401).json({ error: 'Authentication failed' });
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    })(req, res);
  },
  async register(req, res) {
    const { username, email, password, avatar } = req.body;
    let avatarUrl = avatar;
    if (avatar && avatar.startsWith('data:image')) {
      const result = await cloudinary.uploader.upload(avatar);
      avatarUrl = result.secure_url;
    }
    const user = await User.create({ username, email, password, avatar: avatarUrl });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  },
  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  }
};

module.exports = authController;