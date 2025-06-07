const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const friendRoutes = require('./routes/friend');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');

dotenv.config();

app.use(express.json());
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI
}, async (accessToken, refreshToken, profile, done) => {
  const user = await User.findByEmail(profile.emails[0].value) || await User.create({
    username: profile.displayName,
    email: profile.emails[0].value,
    googleId: profile.id,
    avatar: profile.photos[0].value
  });
  done(null, user);
}));

app.use('/auth', authRoutes);
app.use('/friends', friendRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {});