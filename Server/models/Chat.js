const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  user: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("C", chatSchema);
