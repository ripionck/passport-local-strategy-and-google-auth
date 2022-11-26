require("dotenv").config();
const User = require("../models/user.model");
const passport = require("passport");
const bcrypt = require("bcrypt");
//const LocalStrategy = require("passport-local").Strategy;

const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOne({ googleId: profile.id }, (err, user) => {
        if (err) return cb(err, null);

        //not a user; so create a new user with new google id
        if (!user) {
          let newUser = new User({
            googleId: profile.id,
            username: profile.displayName,
          });
          newUser.save();
          return cb(null, newUser);
        } else {
          //if we find an user just return user
          return cb(null, user);
        }
      });
    }
  )
);

// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const user = await User.findOne({ username: username });
//       if (!user) {
//         return done(null, false, { message: "Incorrect Username" });
//       }
//       if (!bcrypt.compare(password, user.password)) {
//         return done(null, false, { message: "Incorrect Password" });
//       }
//       return done(null, user);
//     } catch (error) {
//       return done(error);
//     }
//   })
// );

//create session id
//whatever we login it creates user id inside session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//find session info using session id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});
