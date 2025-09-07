const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const db = require('./models')
require('dotenv').config();

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://inventory-management-app-ctpn.onrender.com/auth/github/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        const email = profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null; // or use '' if you prefer

        db.Users.findOrCreate({
            where: { authId: profile.id },
            defaults: {
                displayName: profile.displayName,
                email: email
            }
        }).then(([user, created]) => {
            return cb(null, user);
        }).catch(err => {
            return cb(err);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
    db.User.findByPk(id).then(function (user) {
        done(null, user);
    });
});