var express = require("express");
var router = express.Router();
const passport = require("passport");
/* GET users listing. */
router.get("/login", (req, res) => {
  res.send("login");
});
router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.redirect("/");
});
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
