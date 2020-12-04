const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    role: [String],
    image: String,
    googleId: String,
    earth_mile_id: String,
    posts: [String],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
