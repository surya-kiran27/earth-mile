const express = require("express");
const router = express.Router();
const User = require("../models/user");
const EarthMile = require("../models/earth-mile");
const passport = require("passport");

//check for authed and role of super user
const checkAuthAndRole = (req, res, next) => {
  if (req.isAuthenticated()) {
    //loop the list of roles and find "super" role
    req.user.role.forEach((role) => {
      if (role === "Super") {
        next();
        return;
      }
    });
    res.json({ success: false, message: "user is not a super user" });
  } else {
    res.json({ success: false, message: "user is not a authenticated" });
  }
};
router.post("/login", passport.authenticate("local", { successRedirect: "/" }));

//making a user admin
router.put("/make-admin", checkAuthAndRole, async (req, res) => {
  if (req.body._id == undefined)
    res.json({ success: false, message: "id is required" });
  const _id = req.body._id;
  try {
    await User.findByIdAndUpdate(_id, { $push: { role: "admin" } });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Error Occurred try again!" });
  }
});
//block a user
router.put("/block-user", checkAuthAndRole, async (req, res) => {
  if (req.body._id == undefined)
    res.json({ success: false, message: "id is required" });
  const _id = req.body._id;
  try {
    await User.findByIdAndUpdate(_id, { $set: { status: "blocked" } });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Error Occurred try again!" });
  }
});
//unblock a user
router.put("/unblock-user", checkAuthAndRole, async (req, res) => {
  if (req.body._id == undefined)
    res.json({ success: false, message: "id is required" });
  const _id = req.body._id;
  try {
    await User.findByIdAndUpdate(_id, { $set: { status: "active" } });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Error Occurred try again!" });
  }
});
//remove an earth mile
router.delete("/delete-earthmile", async (req, res) => {
  if (req.body._id == undefined)
    res.json({ success: false, message: "id is required" });
  const _id = req.body._id;
  try {
    await EarthMile.findByIdAndDelete(_id);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "Error Occurred try again!" });
  }
});
//get all the earth miles
router.get("/earth-miles", checkAuthAndRole, async (req, res) => {
  try {
    const doc = await EarthMile.find();
    let earth_miles = [];
    doc.forEach((earth_mile) => {
      let users = [];
      //get the details of each user
      earth_mile.users.map(async (user_id) => {
        const user = await User.findById(user_id);
        let { username, email, role, image } = user;
        users.push({
          username: username,
          email: email,
          role: role,
          image: image,
        });
      });
      earth_miles.push({
        _id: earth_mile._id,
        location: earth_mile.location.coordinates,
        no_users: earth_mile.no_users,
        distance: earth_mile.distance,
        users: users,
      });
    });
    res.json({ success: true, earth_miles: earth_miles });
  } catch (error) {
    res.json({ success: false, message: "Error occured try again!" });
  }
});

module.exports = router;
