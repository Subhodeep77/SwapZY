const Chat = require("../models/Chat");
const Message = require("../models/Message");
const mongoose = require("mongoose");
const { getAdminId } = require("../utils/appwriteHelpers");
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
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.appwriteId;
    const { chatId } = req.params;
    const { text = "", attachments = [] } = req.body;

    if (!text && attachments.length === 0) {
      return res.status(400).json({ error: "Message must have text or attachments" });
    }

    const chat = await Chat.findById(chatId).lean();
    if (!chat || !chat.participants.includes(senderId)) {
      return res.status(403).json({ error: "Access denied to this chat" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const totalMessagesToday = await Message.countDocuments({
      senderId,
      createdAt: { $gte: todayStart }
    });

    if (totalMessagesToday >= 100) {
      return res.status(429).json({ error: "Daily message limit reached (100)" });
    }

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

    const message = await Message.create({
      chatId,
      senderId,
      text,
      attachments
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text || (attachments.length > 0 ? "[Attachment]" : ""),
      lastMessageAt: new Date()
    });

    // ✅ Emit real-time NEW_MESSAGE event
    const io = req.app.get("io");
    io.to(chatId).emit("NEW_MESSAGE", {
      message,
      senderId
    });

    // ✅ Emit optional delivery receipt
    const receiverId = chat.participants.find(p => p !== senderId);
    if (receiverId) {
      io.to(chatId).emit("MESSAGE_DELIVERED", {
        chatId,
        messageId: message._id,
        recipientId: receiverId
      });
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};


// getMyChats function
const getMyChats = async (req, res) => {
  try {
    const userId = req.user.appwriteId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim();
    const adminOnly = req.query.adminOnly === "true";
    const productId = req.query.productId;

    const matchStage = {
      participants: userId
    };

    if (adminOnly) {
      matchStage.isWithAdmin = true;
    }

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      matchStage.productId = new mongoose.Types.ObjectId(productId);
    }

    const searchRegex = search ? new RegExp(search, "i") : null;

    const pipeline = [
      { $match: matchStage },

      // Lookup product
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

      // Lookup unread messages
      {
        $lookup: {
          from: "messages",
          let: { chatId: "$_id" },
          pipeline: [
            { $match: {
              $expr: {
                $and: [
                  { $eq: ["$chatId", "$$chatId"] },
                  { $not: { $in: [userId, "$readBy"] } },
                  { $ne: ["$senderId", userId] } // optional: don't count own messages
                ]
              }
            }}
          ],
          as: "unreadMessages"
        }
      },

      // Count unread messages
      {
        $addFields: {
          unreadCount: { $size: "$unreadMessages" }
        }
      },

      // Search filter
      ...(searchRegex ? [{
        $match: {
          $or: [
            { lastMessage: { $regex: searchRegex } },
            { "product.title": { $regex: searchRegex } }
          ]
        }
      }] : []),

      // Sort, paginate
      { $sort: { lastMessageAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },

      // Final shape
      {
        $project: {
          _id: 1,
          participants: 1,
          isWithAdmin: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          createdAt: 1,
          updatedAt: 1,
          unreadCount: 1,
          product: {
            _id: 1,
            title: 1,
            images: { $ifNull: ["$product.images", []] }
          }
        }
      }
    ];

    const chats = await Chat.aggregate(pipeline);
    const total = await Chat.countDocuments(matchStage);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalChats: total,
      chats
    });
  } catch (error) {
    console.error("getMyChats error:", error);
    res.status(500).json({ error: "Failed to fetch user chats" });
  }
};

// markChatAsRead function
const markChatAsRead = async (req, res) => {
  try {
    const userId = req.user.appwriteId;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    // Step 1: Check if chat exists and belongs to the user
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ error: "Access denied to this chat" });
    }

    // Step 2: Find unread messages
    const unreadMessages = await Message.find({
      chatId,
      senderId: { $ne: userId },
      readBy: { $ne: userId }
    });

    // Step 3: Mark unread messages as read
    await Message.updateMany(
      {
        _id: { $in: unreadMessages.map(msg => msg._id) }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    // Step 4: Emit socket event for each message read
    const io = req.app.get("io");
    unreadMessages.forEach(msg => {
      io.to(chatId).emit("MESSAGE_READ", {
        chatId,
        messageId: msg._id,
        readerId: userId
      });
    });

    // Step 5: Count messages still unread (fail-safe)
    const unreadLeft = await Message.countDocuments({
      chatId,
      senderId: { $ne: userId },
      readBy: { $ne: userId }
    });

    // Step 6: Send response
    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      unreadLeft
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};

// getChatMessages function
const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.appwriteId;
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { unreadOnly, hasAttachments, search } = req.query;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    // ✅ Step 1: Validate chat access
    const chat = await Chat.findById(chatId).lean();
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ error: "Access denied to this chat" });
    }

    // ✅ Step 2: Build filters
    const filters = { chatId: new mongoose.Types.ObjectId(chatId) };

    if (unreadOnly === "true") {
      filters.readBy = { $ne: userId };
      filters.senderId = { $ne: userId }; // avoid your own messages
    }

    if (hasAttachments === "true") {
      filters.attachments = { $exists: true, $not: { $size: 0 } };
    }

    if (search) {
      filters.text = { $regex: new RegExp(search, "i") };
    }

    // ✅ Step 3: Fetch messages
    const messages = await Message.find(filters)
      .sort({ createdAt: -1 }) // newest first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalMessages = await Message.countDocuments(filters);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalMessages,
      messages,
    });
  } catch (error) {
    console.error("getChatMessages error:", error);
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
};


// reportToAdmin function
const reportToAdmin = async (req, res) => {
  try {
    const userId = req.user.appwriteId;

    // ✅ Step 1: Fetch admin Appwrite ID
    const adminId = await getAdminId();

    // ✅ Step 2: Sorted participants for consistent chat uniqueness
    const participants = [userId, adminId].sort();

    // ✅ Step 3: Check if admin chat already exists
    let chat = await Chat.findOne({
      participants,
      isWithAdmin: true
    });

    let isNewChat = false;

    // ✅ Step 4: Create chat if doesn't exist
    if (!chat) {
      chat = await Chat.create({
        participants,
        isWithAdmin: true,
        lastMessage: "Hi, I need help",
        lastMessageAt: new Date()
      });
      isNewChat = true;
    }

    // ✅ Step 5: Auto-send a first message if it's a new chat
    if (isNewChat) {
      const message = await Message.create({
        chatId: chat._id,
        senderId: userId,
        text: "Hi, I need help"
      });

      // Optional: Emit real-time message
      const io = req.app.get("io");
      io.to(chat._id.toString()).emit("NEW_MESSAGE", {
        message,
        senderId: userId
      });
    }

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error("reportToAdmin error:", error);
    res.status(500).json({ error: "Failed to start chat with admin" });
  }
};

module.exports = { initiateChat, sendMessage, getMyChats, markChatAsRead, getChatMessages, reportToAdmin };