const mongoose = require("mongoose");

const addedVenuesSchema = new mongoose.Schema({
  place_id: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
});

module.exports = addedVenuesSchema;
