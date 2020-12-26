const mongoose = require("mongoose");

const EarthMileSchema = new mongoose.Schema(
  {
    users: [String],
    name: String,
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
      },
    },
    posts: [String],
    address: String,
  },
  { timestamps: true }
);

const EarthMile = mongoose.model("EarthMile", EarthMileSchema);
module.exports = EarthMile;
