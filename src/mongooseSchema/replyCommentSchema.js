const mongoose = require('mongoose')

const replyCommentSchema = new mongoose.Schema({
    data: {type : String, required:true},
    readers: [Number]
}, { timestamp: true })


module.exports = mongoose.model("reply_comment", replyCommentSchema)