const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createOn : {
    type: Date,
    default: Date.now()
  },
  isActive : {
    type: Boolean,
    default: true
  },
  lastSeen : {
    type: Date
  }
})

module.exports = mongoose.model('User',userSchema);