const mongoose = require("mongoose")
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createOn : {
    type: Date,
    default: Date.now() 
  },
  isSeen : {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('Message',messageSchema);