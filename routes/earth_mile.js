const express = require("express");
const router = express.Router();
const User = require("../models/user");
const EarthMile = require("../models/earth-mile");
const Post = require("../models/post");
const checkAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/login");
  }
};
router.get("/posts", async (req, res) => {
  const earth_mile_id = req.query.earth_mile_id;
  if (earth_mile_id === "") res.json({ success: true, posts: [] });
  else {
    try {
      let doc = (await EarthMile.findById(earth_mile_id)).posts;
      let posts = [];
      await doc.map(async (post_id) => {
        const post = await Post.findById(post_id);
        const username = (await User.findById(post.user_id)).username;
        let { title, description, body, category } = post;
        console.log(username, title, description);
        posts.push({
          username: username,
          title: title,
          description: description,
          body: body,
          category: category,
        });
        res.json({ success: true, posts: posts });
      });
    } catch (error) {
      console.log(error);
    }
  }
});
router.get("/get", checkAuth, async (req, res) => {
  const coordinates = req.query.coordinates.split(",").map(Number);
  if (coordinates.length !== 2) {
    res.json({
      success: false,
      earth_mile: {},
      message: "Invalid coordinates",
    });
    return;
  }
  const response = await EarthMile.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: coordinates },
        maxDistance: 1609,
        spherical: true,
        distanceField: "distance",
      },
    },
  ]);
  const earth_miles = response.map((earth_mile) => {
    return {
      location: earth_mile.location.coordinates,
      no_users: earth_mile.no_users,
      distance: earth_mile.distance,
    };
  });
  res.json({ success: true, earth_miles });
});
router.post("/create", checkAuth, async (req, res) => {
  const coordinates = req.body.coordinates.split(",").map(Number);
  if (coordinates.length !== 2) {
    res.json({
      success: false,
      earth_mile: {},
      message: "Invalid coordinates",
    });
    return;
  }
  try {
    const earth_mile = await new EarthMile({
      users: [req.user._id],
      no_posts: 0,
      no_users: 1,
      location: {
        type: "Point",
        coordinates: coordinates,
      },
      posts: [],
    }).save();
    res.json({ success: true, earth_mile: earth_mile });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      earth_mile: {},
      message: "Error occured, try again!",
    });
  }
});
router.post("/create-post", async (req, res) => {
  const earth_mile_id = req.user.earth_mile_id;

  if (earth_mile_id === "") {
    res.json({ success: false, message: "Please join a earth mile first" });
    return;
  }

  const { title, body, category, description } = req.body;

  try {
    const post = await new Post({
      title: title,
      description: description,
      body: body,
      category: category,
      user_id: req.user._id,
      earth_mile_id: earth_mile_id,
    }).save();
    await EarthMile.findByIdAndUpdate(earth_mile_id, {
      $inc: { no_posts: 1 },
      $push: { posts: post.id },
    });
    await User.findByIdAndUpdate(req.user._id, { $push: { posts: post.id } });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to create post, try again!" });
  }
});
router.put();
module.exports = router;
