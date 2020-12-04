const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user_id: String,
    earth_mile_id: String,
    title: String,
    description: String,
    category: String,
    body: String,
    images: [],
  },
  { timestamps: true }
);
const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
