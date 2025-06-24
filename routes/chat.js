const express = require("express");
const router = express.Router();

const {
  reportToAdmin,
  initiateChat,
  getChatMessages,
  markChatAsRead,
  getMyChats
} = require("../../controllers/chat");

const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");

// Start/report chat with admin
router.post("/admin-report", verifyAppwriteToken, reportToAdmin);

// Start a new user-to-user chat
router.post("/initiate", verifyAppwriteToken, initiateChat);

// Get messages in a chat (with pagination and filters)
router.get("/:chatId/messages", verifyAppwriteToken, getChatMessages);

// Mark messages in a chat as read
router.patch("/:chatId/mark-read", verifyAppwriteToken, markChatAsRead);

// Get all my chats
router.get("/my", verifyAppwriteToken, getMyChats);

module.exports = router;
