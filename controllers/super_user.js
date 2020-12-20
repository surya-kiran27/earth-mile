const express = require("express");
const router = express.Router();
const User = require("../models/user");
const EarthMile = require("../models/earth-mile");
const passport = require("passport");

//check for authed and role of super user
const checkAuthAndRole = (req, res, next) => {
  if (req.isAuthenticated()) {
    //loop the list of roles and find "super" role
    let isSuper = false;
    req.user.roles.forEach((role) => {
      if (role === "Super") {
        isSuper = true;
      }
    });

    if (!isSuper)
      res.json({ success: false, message: "user is not a super user" });
    else {
      next();
      return;
    }
  } else {
    res.json({ success: false, message: "user is not a authenticated" });
  }
};
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: true }, (err, super_user, info) => {
    if (err) res.json({ success: false, message: "error occured!" });
    if (super_user) {
      req.logIn(super_user, (err) => {
        console.log("inside login", err, super_user);
        res.json({ success: true, super_user: super_user });
      });
    } else {
      res.json({ success: false, message: info.message });
    }
  })(req, res, next);
});
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
    let earth_miles = doc.map((earth_mile) => {
      //get the details of each user
      // let usersInfo = earth_mile.users.map(async (user_id) => {
      //   const user = await User.findById(user_id);
      //   let { username, email, role, image } = user;
      //   return {
      //     username: username,
      //     email: email,
      //     role: role,
      //     image: image,
      //   };
      // });

      return {
        _id: earth_mile._id,
        location: earth_mile.location.coordinates,
        no_users: earth_mile.no_users,
        no_posts: earth_mile.no_posts,
        createdAt: earth_mile.createdAt,
        updatedAt: earth_mile.updatedAt,
      };
    });
    console.log(earth_miles);
    res.json({ success: true, earth_miles: earth_miles });
  } catch (error) {
    res.json({ success: false, message: "Error occured try again!" });
  }
});
router.get("/users", checkAuthAndRole, async (req, res) => {
  try {
    const doc = await EarthMile.findById(req.query.id);
    let usersInfo = doc.users.map(async (user_id) => {
      const user = await User.findById(user_id);
      let { username, email, role, image } = user;
      return {
        username: username,
        email: email,
        role: role,
        image: image,
      };
    });
    console.log(usersInfo);
    res.json({ success: true, users: usersInfo });
  } catch (error) {
    res.json({ success: false, message: "Error occured try again!" });
  }
});

module.exports = router;
