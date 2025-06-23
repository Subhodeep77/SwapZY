const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true,
    index: true
  },
  text: {
    type: String,
    default: ""
  },
  attachments: [String], // File URLs or fileIds
  readBy: {
    type: [String], // Appwrite user IDs
    default: []
  }
}, { timestamps: true });

messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
