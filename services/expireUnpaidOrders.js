const { Order } = require("../models/Order");
const { AdminAction } = require("../models/admin");
const { Product } = require("../models/Product");
const cron = require("node-cron");

const expireUnpaidOrders = async (io) => {
  const expiryMinutes = 15;
  const expiryTime = new Date(Date.now() - expiryMinutes * 60 * 1000);
  const reason = `Auto-expired due to unpaid status for ${expiryMinutes}+ minutes`;

  const expiredOrders = await Order.find({
    "paymentInfo.status": "pending",
    createdAt: { $lt: expiryTime },
  });

  for (const order of expiredOrders) {
    order.paymentInfo.status = "expired";
    order.status = "EXPIRED";
    order.expiryReason = reason; // ✅ Save the reason string
    await order.save();

    // ✅ Make product available again
    if (order.productId) {
      await Product.findByIdAndUpdate(order.productId, { status: "available" });
    }

    // ✅ Emit socket event
    if (io) {
      io.to(order.buyerId).emit("order:expired", order);
      io.to(order.sellerId).emit("order:expired", order);
    }

    // ✅ Log AdminAction with expiry reason
    await AdminAction.create({
      adminAppwriteId: "system",
      actionType: "ORDER_EXPIRED_AUTO",
      affectedId: order._id,
      description: `Order auto-expired: ${reason}`,
      metadata: {
        reason,
        expiredAt: new Date(),
        paymentStatus: "expired",
      },
    });
  }

  console.log(`✅ Auto-expired ${expiredOrders.length} unpaid orders`);
};

// 🕒 Scheduled execution (must pass io during server boot)
const registerOrderExpiryCron = (io) => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("⏰ Running auto-expire unpaid orders task...");
    await expireUnpaidOrders(io);
  });
};

module.exports = registerOrderExpiryCron;
