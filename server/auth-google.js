const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./models')
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://inventory-management-app-ctpn.onrender.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    db.User.findOrCreate({
      where: { authId: profile.id },
      defaults: {
        displayName: profile.displayName,
        email: profile.emails[0].value
      }
    }).then(([user, created]) => {
      return cb(null, user);
    }).catch(err => {
      return cb(err);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.user_id);
});

passport.deserializeUser(function(id, done) {
  db.User.findByPk(id).then(function(user) {
    done(null, user);
  });
});
