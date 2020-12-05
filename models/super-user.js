const mongoose = require("mongoose");

const SuperUserSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
  },
  { timestamps: true }
);

const SuperUser = mongoose.model("SuperUser", SuperUserSchema);
module.exports = SuperUser;
