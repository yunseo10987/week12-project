const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logingSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
  },
  entryPoint: {
    type: String,
    required: true,
  },
  client_ip: {
    type: Schema.Types.Mixed,
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
