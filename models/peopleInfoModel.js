const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const peopleInfoSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
  },
  number: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  age: {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
  },
});

module.exports = peopleInfoSchema;
