const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  client_ip: {
    type: String,
    required: true,
  },
  request: {
    type: Schema.Types.Mixed,
    required: true,
  },
  response: {
    type: Schema.Types.Mixed,
    required: true,
  },
});
logingSchema.set("timestamps", {
  createdAt: "created_at",
  updatedAt: false,
});

module.exports = mongoose.model("logging", logingSchema);
