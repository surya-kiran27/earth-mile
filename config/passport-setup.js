const { authenticate } = require("passport");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const superUser = require("../models/super-user");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log("inside serialize", user);
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findOne({ _id: id }).then((user) => {
    if (user == null) {
      superUser.findOne({ _id: id }).then((super_user) => {
        console.log("inside deserialize", super_user, id);
        done(null, super_user);
      });
    } else done(null, user);
  });
});
// local strategy for super user
passport.use(
  new LocalStrategy((username, password, done) => {
    superUser.findOne({ username: username }, (err, super_user) => {
      if (err) {
        done(err);
      }
      if (super_user) {
        //compare the passwords
        bcrypt
          .compare(password, super_user.password)
          .then((result) => {
            if (result) done(null, super_user);
            else done(null, false, { message: "Password is incorrect" });
          })
          .catch((err) => {
            done(err);
          });
      } else {
        done(null, false, { message: "User Not Found" });
      }
    });
  })
);
//google strategy for user and admin
passport.use(
  new GoogleStrategy(
    {
      // options for google strategy
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: "/users/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      // check if user already exists in our own db
      User.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          // already have this user
          done(null, currentUser);
        } else {
          // if not, create user in our db
          new User({
            googleId: profile.id,
            username: profile.displayName,
            email: profile._json.email,
            image: profile._json.picture,
            posts: [],
            role: ["user"],
            earth_mile_id: "",
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
    }
  )
);
