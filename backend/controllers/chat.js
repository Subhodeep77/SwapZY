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

    const conflictChat = await Chat.findOne({
      participants,
      isWithAdmin: false,
      productId: { $ne: productId || null },
    });

    if (!isWithAdmin && conflictChat) {
      return res.status(409).json({
        error: "A chat already exists with this user for another product",
        existingChat: conflictChat,
      });
    }

    const query = {
      participants,
      productId: productId || null,
      isWithAdmin,
    };

    let chat = await Chat.findOne(query);

    if (chat) {
      return res.status(200).json({
        success: true,
        chat,
        message: isWithAdmin
          ? "You already have an ongoing support chat with admin"
          : "Chat already exists with this user for this product",
      });
    }

    chat = await Chat.create({
      participants,
      productId: productId || null,
      isWithAdmin,
      lastMessage: "",
      lastMessageAt: null,
    });

    res.status(201).json({
      success: true,
      chat,
      message: isWithAdmin
        ? "Support chat with admin initiated"
        : "Chat initiated successfully",
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
      return res
        .status(400)
        .json({ error: "Message must have text or attachments" });
    }

    const chat = await Chat.findById(chatId).lean();
    if (!chat || !chat.participants.includes(senderId)) {
      return res.status(403).json({ error: "Access denied to this chat" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const totalMessagesToday = await Message.countDocuments({
      senderId,
      createdAt: { $gte: todayStart },
    });

    if (totalMessagesToday >= 100) {
      return res
        .status(429)
        .json({ error: "Daily message limit reached (100)" });
    }

    if (chat.isWithAdmin) {
      const adminMsgsToday = await Message.countDocuments({
        senderId,
        chatId,
        createdAt: { $gte: todayStart },
      });

      if (adminMsgsToday >= 25) {
        return res
          .status(429)
          .json({ error: "Limit to chat with admin is 25 messages/day" });
      }
    }

    const recipientId = chat.participants.find((p) => p !== senderId);

    const message = await Message.create({
      chatId,
      senderId,
      recipientId,
      text,
      attachments,
      isDelivered: true,
      deliveredAt: new Date(),
      seenBy: [],
      reactions: [],
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text || (attachments.length > 0 ? "[Attachment]" : ""),
      lastMessageAt: new Date(),
    });

    const io = req.app.get("io");
    io.to(chatId).emit("NEW_MESSAGE", {
      message,
      senderId,
    });

    if (recipientId) {
      io.to(chatId).emit("MESSAGE_DELIVERED", {
        chatId,
        messageId: message._id,
        recipientId,
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
      participants: userId,
    };

    if (adminOnly) {
      matchStage.isWithAdmin = true;
    }

    if (productId && mongoose.isValidObjectId(productId)) {
      matchStage.productId = mongoose.Types.ObjectId.createFromHexString(productId);
    }

    const searchRegex = search ? new RegExp(search, "i") : null;

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

      // 👇 Lookup unread messages
      {
        $lookup: {
          from: "messages",
          let: { chatId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$chatId", "$$chatId"] },
                    { $not: { $in: [userId, "$readBy"] } },
                    { $ne: ["$senderId", userId] },
                  ],
                },
              },
            },
          ],
          as: "unreadMessages",
        },
      },

      // 👇 Lookup last message and extract top 3 emoji summary + user's reaction
      {
        $lookup: {
          from: "messages",
          let: { chatId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$chatId", "$$chatId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                text: 1,
                reactions: 1,
                reactionSummary: {
                  $slice: [
                    {
                      $map: {
                        input: {
                          $slice: [
                            {
                              $sortArray: {
                                input: {
                                  $map: {
                                    input: { $setUnion: ["$reactions.emoji", []] },
                                    as: "emoji",
                                    in: {
                                      emoji: "$$emoji",
                                      count: {
                                        $size: {
                                          $filter: {
                                            input: "$reactions",
                                            as: "r",
                                            cond: { $eq: ["$$r.emoji", "$$emoji"] }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                sortBy: { count: -1 }
                              }
                            },
                            3
                          ]
                        },
                        as: "r",
                        in: { k: "$$r.emoji", v: "$$r.count" }
                      }
                    },
                    3
                  ]
                },
                userReaction: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$reactions",
                            as: "r",
                            cond: { $eq: ["$$r.userId", userId] }
                          }
                        },
                        as: "ur",
                        in: "$$ur.emoji"
                      }
                    },
                    0
                  ]
                }
              }
            }
          ],
          as: "lastMsgData"
        }
      },
      {
        $addFields: {
          unreadCount: { $size: "$unreadMessages" },
          lastMessageReactions: { $arrayElemAt: ["$lastMsgData.reactionSummary", 0] },
          lastMessageUserReaction: { $arrayElemAt: ["$lastMsgData.userReaction", 0] }
        }
      },

      ...(searchRegex
        ? [
            {
              $match: {
                $or: [
                  { lastMessage: { $regex: searchRegex } },
                  { "product.title": { $regex: searchRegex } },
                ],
              },
            },
          ]
        : []),

      { $sort: { lastMessageAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },

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
          lastMessageReactions: 1,
          lastMessageUserReaction: 1,
          product: {
            _id: 1,
            title: 1,
            images: { $ifNull: ["$product.images", []] },
          },
        },
      },
    ];

    const chats = await Chat.aggregate(pipeline);
    const total = await Chat.countDocuments(matchStage);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalChats: total,
      chats,
    });
  } catch (error) {
    console.error("getMyChats error:", error);
    res.status(500).json({ error: "Failed to fetch user chats" });
  }
};


// markChatAsSeen function
const markChatAsSeen = async (req, res) => {
  try {
    const userId = req.user.appwriteId;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chat ID" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ error: "Access denied to this chat" });
    }

    const unreadMessages = await Message.find({
      chatId,
      senderId: { $ne: userId },
      "seenBy.userId": { $ne: userId }
    });

    const now = new Date();

    const bulkOps = unreadMessages.map((msg) => ({
      updateOne: {
        filter: { _id: msg._id },
        update: {
          $addToSet: {
            seenBy: { userId, seenAt: now }
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      await Message.bulkWrite(bulkOps);
    }

    const io = req.app.get("io");
    unreadMessages.forEach((msg) => {
      io.to(chatId).emit("MESSAGE_READ", {
        chatId,
        messageId: msg._id,
        readerId: userId,
        seenAt: now
      });
    });

    const unreadLeft = await Message.countDocuments({
      chatId,
      senderId: { $ne: userId },
      "seenBy.userId": { $ne: userId }
    });

    res.status(200).json({
      success: true,
      message: "Messages marked as seen",
      unreadLeft
    });
  } catch (error) {
    console.error("markChatAsSeen error:", error);
    res.status(500).json({ error: "Failed to mark messages as seen" });
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

    const chat = await Chat.findById(chatId).lean();
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ error: "Access denied to this chat" });
    }

    const filters = { chatId: new mongoose.Types.ObjectId(chatId) };

    if (unreadOnly === "true") {
      filters.readBy = { $ne: userId };
      filters.senderId = { $ne: userId };
    }

    if (hasAttachments === "true") {
      filters.attachments = { $exists: true, $not: { $size: 0 } };
    }

    if (search) {
      filters.text = { $regex: new RegExp(search, "i") };
    }

    const messages = await Message.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const enrichedMessages = messages.map((msg) => {
      const summary = {};
      msg.reactions?.forEach(({ emoji }) => {
        summary[emoji] = (summary[emoji] || 0) + 1;
      });

      // Sort summary and pick top 3
      const top3Reactions = Object.entries(summary)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .reduce((acc, [emoji, count]) => {
          acc[emoji] = count;
          return acc;
        }, {});

      const userReaction = msg.reactions?.find((r) => r.userId === userId) || null;

      return {
        ...msg,
        top3Reactions,
        userReaction,
      };
    });

    const totalMessages = await Message.countDocuments(filters);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalMessages,
      messages: enrichedMessages,
    });
  } catch (error) {
    console.error("getChatMessages error:", error);
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
};


// getUndeliveredMessages function
const getUndeliveredMessages = async (req, res) => {
  try {
    const userId = req.user.appwriteId;

    const messages = await Message.find({
      recipientId: userId,
      isDelivered: false,
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("getUndeliveredMessages error:", error);
    res.status(500).json({ error: "Failed to fetch undelivered messages" });
  }
};

// reactToMessage controller
const reactToMessage = async (req, res) => {
  try {
    const userId = req.user.appwriteId;
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ error: "Emoji reaction is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId === userId
    );

    if (existingIndex !== -1) {
      // Update existing reaction
      message.reactions[existingIndex].emoji = emoji;
    } else {
      // Add new reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Emit REACTION_UPDATED via socket
    const io = req.app.get("io");
    io.to(message.chatId.toString()).emit("REACTION_UPDATED", {
      messageId: message._id,
      userId,
      emoji,
    });

    res.status(200).json({
      success: true,
      message: "Reaction updated successfully",
      reactions: message.reactions,
    });
  } catch (error) {
    console.error("reactToMessage error:", error);
    res.status(500).json({ error: "Failed to react to message" });
  }
};

// reportToAdmin function
const reportToAdmin = async (req, res) => {
  try {
    const userId = req.user.appwriteId;
    const { text = "Hi, I need help" } = req.body;

    const adminId = await getAdminId();
    const participants = [userId, adminId].sort();

    let chat = await Chat.findOne({ participants, isWithAdmin: true });

    if (!chat) {
      chat = await Chat.create({
        participants,
        isWithAdmin: true,
        lastMessage: text,
        lastMessageAt: new Date(),
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const adminMsgsToday = await Message.countDocuments({
      senderId: userId,
      chatId: chat._id,
      createdAt: { $gte: todayStart },
    });

    if (adminMsgsToday >= 25) {
      return res
        .status(429)
        .json({ error: "Limit to chat with admin is 25 messages/day" });
    }

    const message = await Message.create({
      chatId: chat._id,
      senderId: userId,
      recipientId: adminId,
      text: text.trim() || "Hi, I need help",
      isDelivered: true,
      deliveredAt: new Date(),
    });

    await Chat.findByIdAndUpdate(chat._id, {
      lastMessage: message.text,
      lastMessageAt: new Date(),
    });

    const io = req.app.get("io");
    io.to(chat._id.toString()).emit("NEW_MESSAGE", {
      message,
      senderId: userId,
    });

    res.status(200).json({
      success: true,
      chat,
      message: "Support message sent to admin",
    });
  } catch (error) {
    console.error("reportToAdmin error:", error);
    res.status(500).json({ error: "Failed to start chat with admin" });
  }
};

// unreactToMessage function
const unreactToMessage = async (req, res) => {
  try {
    const userId = req.user.appwriteId;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const initialLength = message.reactions.length;
    message.reactions = message.reactions.filter((r) => r.userId !== userId);

    if (message.reactions.length === initialLength) {
      return res.status(404).json({ error: "No reaction found to remove" });
    }

    await message.save();

    // Emit event
    const io = req.app.get("io");
    io.to(message.chatId.toString()).emit("REACTION_REMOVED", {
      messageId: message._id,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Reaction removed successfully",
      reactions: message.reactions,
    });
  } catch (error) {
    console.error("unreactToMessage error:", error);
    res.status(500).json({ error: "Failed to remove reaction" });
  }
};

module.exports = {
  initiateChat,
  sendMessage,
  getMyChats,
  markChatAsSeen,
  getChatMessages,
  reportToAdmin,
  getUndeliveredMessages,
  unreactToMessage,
  reactToMessage,
};
