const mongoose = require("mongoose");
mongoose.connect(
  process.env.dbURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("connecterd to mongoDB");
  }
);
