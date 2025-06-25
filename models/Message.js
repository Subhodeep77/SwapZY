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
  recipientId: {
    type: String, // Appwrite user ID
    required: true,
    index: true
  },
  text: {
    type: String,
    default: ""
  },
  attachments: [String], // File URLs or fileIds

  // Read tracking
  readBy: {
    type: [String],
    default: []
  },

  // Delivery tracking
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 * 6 }); // Auto-expire after 6 months

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
