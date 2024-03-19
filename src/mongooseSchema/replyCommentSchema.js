const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replyCommentSchema = new mongoose.Schema(
  {
    post_idx: Number,
    comment_idx: Number,
    writer_idx: Number,
    writer_nickname: String,
    content: { type: String, required: true },
    comment: Schema.Types.Mixed,
  },
  { timestamp: true }
);

module.exports = mongoose.model("reply_comment", replyCommentSchema);
