const mongoose = require("mongoose");
const addedVenuesSchema = require("./addedVenueModel");
const peopleInfoSchema = require("./peopleInfoModel");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  isthisDate: {
    type: Boolean,
    required: true,
  },
  TicketPrice: {
    type: Number,
    required: true,
  },
  locationings: [
    {
      type: addedVenuesSchema,
      required: true,
    },
  ],
  peopleinformations: [
    {
      type: peopleInfoSchema,
      required: true,
    },
  ],
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
