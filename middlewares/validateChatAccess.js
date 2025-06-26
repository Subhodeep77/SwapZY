const mongoose = require("mongoose");
const Chat = require("../models/Chat");

const validateChatAccess = async (chatId, userId) => {
  if (!mongoose.isValidObjectId(chatId)) {
    throw new Error("Invalid chat ID");
  }

  const chat = await Chat.findById(chatId).lean();
  if (!chat) {
    throw new Error("Chat not found");
  }

  if (!chat.participants.includes(userId)) {
    throw new Error("Access denied to this chat");
  }

  return chat;
};

module.exports = validateChatAccess;
