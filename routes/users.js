const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

/* GET users listing. */
router.get("/login", (req, res) => {
  res.send("login");
});
router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);
router.get("/google/check", (req, res) => {
  if (req.user) res.json({ success: true, user: req.user });
  else res.json({ success: false });
});
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});
router.get("/getEarthMile", (req, res) => {
  User.findById(req.user._id, (err, doc) => {
    if (err) res.json({ success: false, message: "error fetch details!" });
    res.json({ success: true, earth_mile_id: doc.earth_mile_id });
  });
});
module.exports = router;
