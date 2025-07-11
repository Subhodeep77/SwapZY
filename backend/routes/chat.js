const express = require("express");
const router = express.Router();
const {
  initiateChat,
  sendMessage,
  getMyChats,
  markChatAsSeen,
  getChatMessages,
  reportToAdmin,
  getUndeliveredMessages,
  reactToMessage,
  unreactToMessage
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
router.patch("/:chatId/read", markChatAsSeen);

// 6. Report an issue to admin (starts a support chat)
router.post("/admin-report", reportToAdmin);

// 7. Get all undelivered messages
router.get("/undelivered", getUndeliveredMessages);

// 8. React emojis on messages
router.post("/message/:messageId/react", reactToMessage);

// 9. Unreact the emojis on messages 
router.delete("/message/:messageId/unreact", unreactToMessage);

console.log(`Loaded chat routes`);

module.exports = router;
