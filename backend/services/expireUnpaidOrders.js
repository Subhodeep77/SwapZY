const { Order, OrderActivityLog } = require("../models/Order");
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
    order.expiryReason = reason;
    await order.save();

    // ✅ Unconditionally make product available if order is auto-expired
    if (order.status === "EXPIRED" && order.expiryReason?.includes("Auto-expired")) {
      await Product.findByIdAndUpdate(order.productId, { status: "available" });
    }

    const product = await Product.findById(order.productId).lean();

    // ✅ Emit socket events
    const payload = {
      order,
      product: product ? {
        _id: product._id,
        title: product.title,
        thumbnail: product.thumbnail,
        status: product.status,
      } : null,
    };

    if (io) {
      io.to(order.buyerId).emit("order:expired", payload);
      io.to(order.sellerId).emit("order:expired", payload);

      io.to(order.buyerId).emit("order:statusChanged", {
        orderId: order._id,
        status: "EXPIRED",
        updatedAt: order.updatedAt,
      });
      io.to(order.sellerId).emit("order:statusChanged", {
        orderId: order._id,
        status: "EXPIRED",
        updatedAt: order.updatedAt,
      });

      io.to("admin").emit("admin:orderExpired", payload);
    }

    // ✅ Admin action log
    await AdminAction.create({
      adminAppwriteId: "system",
      actionType: "ORDER_EXPIRED_AUTO",
      affectedId: order._id,
      description: `Order auto-expired: ${reason}`,
      metadata: {
        reason,
        expiredAt: new Date(),
        paymentStatus: "expired",
        orderId: order._id,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
      },
    });

    // ✅ Order activity log
    await OrderActivityLog.create({
      orderId: order._id,
      actorId: "system",
      action: "ORDER_EXPIRED",
      remarks: reason,
    });
  }

  console.log(`✅ Auto-expired ${expiredOrders.length} unpaid orders`);
};

// ⏰ Scheduled cron
const registerOrderExpiryCron = (io) => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("⏰ Running auto-expire unpaid orders task...");
    await expireUnpaidOrders(io);
  });
};

module.exports = registerOrderExpiryCron;
