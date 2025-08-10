const Product = require("../models/Product");
const Order = require("../models/Order");
const { OrderActivityLog } = require("../models/Order");
const Wishlist = require("../models/Wishlist");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

const cascadeDeleteUser = async (appwriteId) => {
  try {
    await Product.deleteMany({ ownerId: appwriteId });

    await Order.deleteMany({
      $or: [{ buyerId: appwriteId }, { sellerId: appwriteId }],
    });

    await OrderActivityLog.deleteMany({ actorId: appwriteId });

    await Wishlist.deleteMany({ userId: appwriteId });

    const userChats = await Chat.find({ participants: appwriteId });

    const chatIds = userChats.map((chat) => chat._id);

    await Chat.deleteMany({ _id: { $in: chatIds } });

    await Message.deleteMany({
      $or: [
        { senderId: appwriteId },
        { recipientId: appwriteId },
        { chatId: { $in: chatIds } },
      ],
    });

    console.log(`✅ Cascade deletion completed for user: ${appwriteId}`);
  } catch (error) {
    console.error(`❌ Cascade deletion failed: ${error.message}`);
    throw new Error("Cascade deletion failed: " + error.message);
  }
};

module.exports = cascadeDeleteUser;
