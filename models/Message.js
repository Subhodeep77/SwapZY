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

  // Delivery tracking
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },

  // NEW: Seen timestamp tracking
  seenBy: [
    {
      userId: { type: String, required: true },
      seenAt: { type: Date, required: true }
    }
  ],

  // NEW: Emoji reactions
  reactions: [
    {
      userId: { type: String, required: true },
      emoji: { type: String, required: true }
    }
  ]
}, { timestamps: true });

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 * 6 }); // Auto-expire after 6 months

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
