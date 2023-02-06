const mongoose = require("mongoose");
const googleSchema = new mongoose.Schema(
  {
    venue_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: Array,
      required: true,
    },

    location: {
      lat: {
        type: String,
        required: true,
      },
      lng: {
        type: String,
        required: true,
      },
    },
    google_place_id: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },

    city: {
      type: String,
    },
    street: {
      type: String,
    },
    building: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    website: {
      type: String,
    },
    isPrivate: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Google", googleSchema);
