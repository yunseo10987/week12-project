const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  writer: {
    type: String,
    required: true,
  },
  receiver: Number,
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  is_read: Boolean,
});

notificationSchema.set("timestamps", {
  createdAt: "created_at",
  updatedAt: false,
});

module.exports = mongoose.model("notifications", notificationSchema);
