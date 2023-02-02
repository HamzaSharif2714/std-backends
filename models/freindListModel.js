const mongoose = require("mongoose");
const friendListSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Friend", friendListSchema);
