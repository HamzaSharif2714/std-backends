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
      match:
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
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
