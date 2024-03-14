const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    data: {type : String, required:true},
    readers: [Number]
}, { timestamp: true })


module.exports = mongoose.model("notifications", notificationSchema)