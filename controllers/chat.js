const Chat = require("../models/Chat");



// initiateChat function
const initiateChat = async (req, res) => {
  try {
    const userId = req.user.appwriteId;
    const { otherUserId, productId = null, isWithAdmin = false } = req.body;

    if (!otherUserId || otherUserId === userId) {
      return res.status(400).json({ error: "Invalid recipient user ID" });
    }

    const participants = [userId, otherUserId].sort();

    // Step 1: Check if a conflicting chat already exists
    const conflictChat = await Chat.findOne({
      participants,
      isWithAdmin: false,
      productId: { $ne: productId || null }
    });

    if (!isWithAdmin && conflictChat) {
      return res.status(409).json({
        error: "A chat already exists with this user for another product",
        existingChat: conflictChat
      });
    }

    // Step 2: Build proper query including isWithAdmin
    const query = {
      participants,
      productId: productId || null,
      isWithAdmin
    };

    let chat = await Chat.findOne(query);

    if (chat) {
      return res.status(200).json({
        success: true,
        chat,
        message: isWithAdmin
          ? "You already have an ongoing support chat with admin"
          : "Chat already exists with this user for this product"
      });
    }

    // Step 3: Create new chat
    chat = await Chat.create({
      participants,
      productId: productId || null,
      isWithAdmin,
      lastMessage: "",
      lastMessageAt: null
    });

    res.status(201).json({
      success: true,
      chat,
      message: isWithAdmin
        ? "Support chat with admin initiated"
        : "Chat initiated successfully"
    });
  } catch (error) {
    console.error("Initiate chat error:", error);
    res.status(500).json({ error: "Failed to initiate or retrieve chat" });
  }
};

// sendMessage function
const Message = require("../models/Message");
const Chat = require("../models/Chat");

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.appwriteId;
    const { chatId } = req.params;
    const { text = "", attachments = [] } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(senderId)) {
      return res.status(403).json({ error: "Access denied to this chat" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 🟡 Check total message quota first
    const totalMessagesToday = await Message.countDocuments({
      senderId,
      createdAt: { $gte: todayStart }
    });

    if (totalMessagesToday >= 100) {
      return res.status(429).json({ error: "Daily message limit reached (100)" });
    }

    // 🔵 If admin chat, also enforce admin quota
    if (chat.isWithAdmin) {
      const adminMsgsToday = await Message.countDocuments({
        senderId,
        chatId,
        createdAt: { $gte: todayStart }
      });

      if (adminMsgsToday >= 25) {
        return res.status(429).json({ error: "Limit to chat with admin is 25 messages/day" });
      }
    }

    // ✅ All checks passed, send the message
    const message = await Message.create({
      chatId,
      senderId,
      text,
      attachments
    });

    chat.lastMessage = text || (attachments.length > 0 ? "[Attachment]" : "");
    chat.lastMessageAt = new Date();
    await chat.save();

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};



module.exports = { initiateChat, sendMessage };