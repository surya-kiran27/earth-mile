const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    bio: String,
    image: String,
    googleId: String,
    posts: [{ type: mongooseClient.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
