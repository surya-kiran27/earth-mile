const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});
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
          console.log("user is: ", currentUser);
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
              console.log("new user created: ", newUser);
              done(null, newUser);
            });
        }
      });
    }
  )
);
