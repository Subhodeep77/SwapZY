const express = require("express");
const router = express.Router();
const {
  initiateChat,
  sendMessage,
  getMyChats,
  markChatAsRead,
  getChatMessages,
  reportToAdmin,
} = require("../controllers/chat");
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const { getMessagesLimiter } = require("../utils/rateLimiter");

// Protect all chat routes
router.use(verifyAppwriteToken);

// 1. Create or get chat between two users (optional product-based)
router.post("/initiate", initiateChat);

// 2. Get all messages of a chat with pagination & filters
router.get("/:chatId/messages", getMessagesLimiter, getChatMessages);

// 3. Send a message to a chat
router.post("/:chatId/message", sendMessage);

// 4. List all user chats (latest message + unread count)
router.get("/my", getMyChats);

// 5. Mark all unread messages in a chat as read
router.patch("/:chatId/read", markChatAsRead);

// 6. Report an issue to admin (starts a support chat)
router.post("/admin-report", reportToAdmin);

module.exports = router;
