const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const counterSchema = new mongoose.Schema(
  {
    counter: {
      type: Number,
      default: 0,
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("counter", counterSchema);
