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
router.get("/Posts", async (req, res) => {
  const earth_mile_id = req.query.id;
  const category = req.query.category;
  if (typeof earth_mile_id === "undefined" || earth_mile_id === "")
    res.json({ success: true, posts: [] });
  else {
    try {
      console.log(category, earth_mile_id);
      let doc = await EarthMile.findById(earth_mile_id);

      const result = doc[category].map(async (post_id) => {
        const post = await Post.findById(post_id);
        const { username, image } = await User.findById(post.user_id);
        let { title, description, body, category, createdAt } = post;

        return {
          username,
          image,
          title: title,
          description: description,
          body: body,
          category: category,
          createdAt,
        };
      });
      Promise.all(result).then((posts) => {
        console.log(posts, "posts");
        res.json({ success: true, posts: posts });
      });
    } catch (error) {
      console.log(error);
    }
  }
});
router.get("/earth-mile", checkAuth, async (req, res) => {
  const id = req.query.id;
  if (typeof id === "undefined" || id == null || id === "")
    res.json({
      success: false,
      message: "missing parameters or invalid value",
    });
  try {
    let doc = await EarthMile.findById(id);
    let result = doc;
    result["No_Posts"] =
      doc.humans.length + doc.animals.length + doc.environment.length;
    console.log(result);
    res.json({ success: true, earth_mile: result });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "error occured!" });
  }
});
router.get("/", checkAuth, async (req, res) => {
  const coordinates = req.query.coordinates.split(",").map(Number);
  if (coordinates.length !== 2) {
    res.json({
      success: false,
      earth_mile: {},
      message: "Invalid coordinates",
    });
    return;
  }
  console.log(req.query.coordinates);
  const response = await EarthMile.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: coordinates },

        spherical: true,
        distanceField: "distance",
      },
    },
  ]);
  console.log(response);
  const earth_miles = response.map((earth_mile) => {
    const No_Posts =
      earth_mile.humans.length +
      earth_mile.animals.length +
      earth_mile.environment.length;
    return {
      _id: earth_mile._id,
      location: earth_mile.location.coordinates,
      users: earth_mile.users,
      No_Posts,
      createdAt: earth_mile.createdAt,
    };
  });
  res.json({ success: true, earth_miles });
});
router.post("/create", checkAuth, async (req, res) => {
  const { name, address } = req.body;
  if (
    name === undefined ||
    address === undefined ||
    name === "" ||
    address == "" ||
    req.body.coordinates === ""
  ) {
    res.json({ success: false, message: "invalid details" });
    return;
  }
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
      name,
      address,
      location: {
        type: "Point",
        coordinates: coordinates,
      },
      humans: [],
      animals: [],
      environment: [],
    }).save();
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { earth_mile_id: earth_mile._id } }
    );
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
  const earth_mile_id = req.body.earth_mile_id;

  if (earth_mile_id === "") {
    res.json({ success: false, message: "Invalid parameters" });
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
      $push: { [category]: post.id },
    });
    humans = await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to create post, try again!" });
  }
});
module.exports = router;
