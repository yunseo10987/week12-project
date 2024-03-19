const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema(
  {
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
    // "created_at": {
    //     type: Date,
    //     default: Date.now
    // }
  },
  { timestamp: true }
);

// notificationSchema.set('timestamp')

module.exports = mongoose.model("notifications", notificationSchema);
