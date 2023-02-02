const mongoose = require("mongoose");

const peopleInfoSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  number: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  age: [{ type: Number }],
});

module.exports = peopleInfoSchema;
