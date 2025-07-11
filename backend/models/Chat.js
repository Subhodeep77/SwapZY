const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: {
    type: [String], // Appwrite user IDs
    required: true,
    validate: [v => v.length === 2, "Chat must have exactly 2 participants"],
    index: true // 📌 For fast participant filtering
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    index: true
  },
  lastMessage: {
    type: String,
    default: ""
  },
  lastMessageAt: {
    type: Date,
    default: null,
    index: true
  },
  isWithAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

chatSchema.index({ participants: 1, productId: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
