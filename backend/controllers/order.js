// controllers/orderController.js
const Order = require("../models/Order").Order;
const Product = require("../models/Product");
const OrderActivityLog = require("../models/Order").OrderActivityLog;
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { emitToRoomIfExists } = require("../utils/socketHelper");
const Razorpay = require("razorpay");
const { AdminAction } = require("../models/Admin"); 
const cron = require("node-cron");
let CRON_ENABLED = true; // 🆕 Toggle flag

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const buyerId = req.user.appwriteId;
    const {
      productId,
      amount = 0,
      notes = "",
      deliveryInfo = "",
      chatId = null,
    } = req.body;

    const existingOrdersToday = await Order.countDocuments({
      buyerId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (existingOrdersToday >= 10) {
      return res
        .status(429)
        .json({ error: "Daily order limit reached (5 per day)" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.ownerId === buyerId)
      return res
        .status(400)
        .json({ error: "You cannot order your own product" });

    const order = await Order.create({
      productId,
      buyerId,
      sellerId: product.ownerId,
      amount,
      notes,
      deliveryInfo,
      chatId,
    });

    const io = req.app.get("io");
    emitToRoomIfExists(io, order.chatId, "order:new", { order });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
};

// Seller responds to order (accept/reject)
const respondToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body;
    const sellerId = req.user.appwriteId;

    const order = await Order.findById(orderId);
    if (!order || order.sellerId !== sellerId) {
      return res
        .status(404)
        .json({ error: "Order not found or access denied" });
    }

    if (!["ACCEPTED", "REJECTED"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    order.status = action;
    if (action === "ACCEPTED") order.acceptedAt = new Date();
    await order.save();

    await OrderActivityLog.create({
      orderId: order._id,
      actorId: sellerId,
      action: `ORDER_${action}`,
      remarks: `Order ${action.toLowerCase()} by seller`,
    });

    const io = req.app.get("io");
    emitToRoomIfExists(io, order.chatId, "order:statusChanged", {
      orderId: order._id,
      status: action,
      updatedAt: order.updatedAt,
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Respond to order error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

// Get orders for current buyer/seller with optional filters
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.appwriteId;
    const { role } = req.query; // 'buyer' or 'seller'
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (role === "buyer") query.buyerId = userId;
    else if (role === "seller") query.sellerId = userId;
    else return res.status(400).json({ error: "Invalid role filter" });

    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("productId")
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Admin can view all orders
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      userId, // 🆕 Admin can filter by buyer/seller ID
      productId,
    } = req.query;

    const skip = (page - 1) * limit;
    const filters = { isDeleted: false };

    if (status) filters.status = status;
    if (productId) filters.productId = productId;

    if (userId) {
      filters.$or = [{ buyerId: userId }, { sellerId: userId }];
    }

    const [orders, total] = await Promise.all([
      Order.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filters),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin fetch orders error:", error.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// 🔍 Get logs for a specific order
const getOrderActivityLog = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { from, to, action, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { orderId };

    if (action) query.action = action;

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      OrderActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      OrderActivityLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get order logs error:", error);
    res.status(500).json({ error: "Failed to fetch order logs" });
  }
};

// 📁 Export logs to CSV (Role-based: Admin or Actor)
const MAX_EXPORT_ORDERS = 20;

const exportMultipleOrderLogsZip = async (req, res) => {
  try {
    const {
      orderIds = [],
      from,
      to,
      action,
      actorId, // 🆕 optional filter for admin
      page = 1,
      limit = 10,
    } = req.body;

    const userId = req.user.appwriteId;
    const isAdmin = req.user.role === "ADMIN";

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "Provide a list of orderIds" });
    }

    const paginatedOrderIds = orderIds.slice((page - 1) * limit, page * limit);

    if (paginatedOrderIds.length > MAX_EXPORT_ORDERS) {
      return res.status(400).json({
        error: `You can export up to ${MAX_EXPORT_ORDERS} orders at once`,
      });
    }

    // Prepare response headers
    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=order_logs_page${page}.zip`,
    });

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(res);

    const fields = ["orderId", "actorId", "action", "remarks", "timestamp"];
    const parser = new Parser({ fields });

    for (const orderId of paginatedOrderIds) {
      const query = { orderId };

      if (!isAdmin) {
        query.actorId = userId;
      } else if (actorId) {
        query.actorId = actorId; // ✅ Admin can filter by actor
      }

      if (action) query.action = action;

      if (from || to) {
        query.timestamp = {};
        if (from) query.timestamp.$gte = new Date(from);
        if (to) query.timestamp.$lte = new Date(to);
      }

      const logs = await OrderActivityLog.find(query).lean();
      if (!logs.length) continue;

      const csv = parser.parse(logs);
      archive.append(csv, { name: `order_logs_${orderId}.csv` });
    }

    await archive.finalize();

    // ✅ Let Node.js GC clean up memory buffer after download ends
    res.on("finish", () => {
      console.log("ZIP sent and memory cleaned.");
    });
  } catch (error) {
    console.error("ZIP export error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate ZIP file" });
    }
  }
};

// 📊 Get summary per user or order (count of actions)
const getActivitySummary = async (req, res) => {
  try {
    const { type = "user", id } = req.query; // type=user|order, id=actorId/orderId

    const match = type === "user" ? { actorId: id } : { orderId: id };
    const summary = await OrderActivityLog.aggregate([
      { $match: match },
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("Summary fetch error:", error);
    res.status(500).json({ error: "Failed to fetch activity summary" });
  }
};

// 🔎 Admin fetch logs by actor (userId)
const getLogsByActor = async (req, res) => {
  try {
    const { actorId, from, to, action, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    if (!actorId) {
      return res.status(400).json({ error: "actorId is required" });
    }

    const query = { actorId };

    if (action) query.action = action;

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      OrderActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      OrderActivityLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch logs by actor error:", error);
    res.status(500).json({ error: "Failed to fetch actor logs" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.appwriteId;

    const recentCancellations = await OrderActivityLog.countDocuments({
      actorId: userId,
      action: "ORDER_CANCELLED",
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (recentCancellations >= 5) {
      return res
        .status(429)
        .json({ error: "Cancellation limit reached (5 per day)" });
    }

    const order = await Order.findById(orderId);
    if (!order || order.status !== "PENDING") {
      return res.status(400).json({ error: "Cannot cancel this order" });
    }

    const isParticipant = order.buyerId === userId || order.sellerId === userId;
    if (!isParticipant) return res.status(403).json({ error: "Access denied" });

    order.status = "CANCELLED";
    await order.save();

    await OrderActivityLog.create({
      orderId,
      actorId: userId,
      action: "ORDER_CANCELLED",
      remarks: "Order cancelled by participant",
    });

    const io = req.app.get("io");
    emitToRoomIfExists(io, order.chatId, "order:cancelled", {
      orderId: order._id,
      cancelledBy: userId,
      updatedAt: order.updatedAt,
    });

    res.json({ success: true, order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

const MAX_ADMIN_DELETE_LIMIT = 10; // You can tweak this as needed

// DELETE or SOFT DELETE Order by Admin
const deleteOrderByAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { hard = false } = req.query;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const recentDeletes = await OrderActivityLog.countDocuments({
      actorId: req.user.appwriteId,
      action: {
        $in: ["ORDER_SOFT_DELETED_BY_ADMIN", "ORDER_HARD_DELETED_BY_ADMIN"],
      },
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });

    if (recentDeletes >= MAX_ADMIN_DELETE_LIMIT) {
      return res.status(429).json({ error: "Too many deletions. Try later." });
    }

    if (hard === "true") {
      await order.deleteOne();
    } else {
      if (order.isDeleted)
        return res.status(400).json({ error: "Order already soft deleted" });
      order.isDeleted = true;
      order.deletedAt = new Date();
      order.deletedBy = req.user.appwriteId;
      await order.save();
    }

    await OrderActivityLog.create({
      orderId,
      actorId: req.user.appwriteId,
      action:
        hard === "true"
          ? "ORDER_HARD_DELETED_BY_ADMIN"
          : "ORDER_SOFT_DELETED_BY_ADMIN",
      remarks:
        hard === "true"
          ? "Hard delete executed by admin"
          : "Soft delete marked by admin",
    });

    const io = req.app.get("io");
    emitToRoomIfExists(io, order.chatId, "order:deleted", {
      orderId: order._id,
      deletedBy: req.user.appwriteId,
      hard: hard === "true",
    });

    res.json({
      success: true,
      message:
        hard === "true" ? "Order permanently deleted" : "Order soft deleted",
    });
  } catch (error) {
    console.error("Admin delete order error:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};

// RESTORE soft-deleted order by Admin
const undoDeleteOrderByAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order || !order.isDeleted) {
      return res.status(404).json({ error: "No soft-deleted order found" });
    }

    order.isDeleted = false;
    order.deletedAt = null;
    order.deletedBy = null;
    await order.save();

    await OrderActivityLog.create({
      orderId,
      actorId: req.user.appwriteId,
      action: "ORDER_RESTORED_BY_ADMIN",
      remarks: "Soft-deleted order restored",
    });

    const io = req.app.get("io");
    emitToRoomIfExists(io, order.chatId, "order:restored", {
      orderId: order._id,
      restoredBy: req.user.appwriteId,
    });

    res.json({ success: true, message: "Order restored successfully" });
  } catch (error) {
    console.error("Undo delete error:", error);
    res.status(500).json({ error: "Failed to restore order" });
  }
};

const getSoftDeletedOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      buyerId,
      sellerId,
      productId,
      status,
      from,
      to,
    } = req.query;

    const skip = (page - 1) * limit;
    const filters = { isDeleted: true };

    if (buyerId) filters.buyerId = buyerId;
    if (sellerId) filters.sellerId = sellerId;
    if (productId) filters.productId = productId;
    if (status) filters.status = status;

    if (from || to) {
      filters.deletedAt = {};
      if (from) filters.deletedAt.$gte = new Date(from);
      if (to) filters.deletedAt.$lte = new Date(to);
    }

    const [orders, total] = await Promise.all([
      Order.find(filters)
        .sort({ deletedAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filters),
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch soft-deleted orders error:", error);
    res.status(500).json({ error: "Failed to fetch deleted orders" });
  }
};

const exportDeletedOrdersZip = async (req, res) => {
  try {
    const {
      from,
      to,
      status,
      buyerId,
      sellerId,
      page = 1,
      limit = 100,
    } = req.query;

    const query = { isDeleted: true };

    if (status) query.status = status;
    if (buyerId) query.buyerId = buyerId;
    if (sellerId) query.sellerId = sellerId;

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    if (!orders.length) {
      return res
        .status(404)
        .json({ error: "No deleted orders found for given criteria" });
    }

    const fields = [
      "_id",
      "productId",
      "buyerId",
      "sellerId",
      "status",
      "amount",
      "createdAt",
      "deletedAt",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(orders);

    // Set zip headers
    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=deleted_orders_page${page}.zip`,
    });

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(res);

    // Append the CSV string to the zip file
    archive.append(csv, { name: `deleted_orders_page${page}.csv` });

    await archive.finalize();

    res.on("finish", () => {
      console.log(`Deleted orders ZIP (page ${page}) sent.`);
    });
  } catch (error) {
    console.error("Deleted orders ZIP export error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to export deleted orders ZIP" });
    }
  }
};


const refundPayment = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const order = await Order.findById(orderId);

    if (!order || order.paymentInfo.status !== "paid") {
      return res.status(400).json({ error: "Refund not applicable" });
    }

    const io = req.app.get("io");

    // ✅ Emit refund initiation event (before Razorpay API call)
    io.to(order.buyerId).emit("order:refundInitiated", {
      orderId: order._id,
      amount: order.paymentInfo.amount,
      reason: reason || "Admin initiated refund",
    });

    // 💸 Call Razorpay refund
    const refund = await Razorpay.payments.refund(order.paymentInfo.paymentId, {
      speed: "optimum",
      notes: { reason: reason || "Admin initiated refund" },
    });

    // ✅ Update DB
    order.paymentInfo.status = "refunded";
    order.paymentInfo.refundedAt = new Date();
    order.paymentInfo.refundReason = reason;
    await order.save();

    // ✅ Log AdminAction
    await AdminAction.create({
      adminAppwriteId: req.user.appwriteId,
      actionType: "REFUND_ISSUED",
      description: `Refund issued for Order ${orderId} (₹${order.paymentInfo.amount})`,
      affectedId: orderId,
      metadata: {
        refundId: refund.id,
        reason: reason || "Admin initiated refund",
        paymentId: order.paymentInfo.paymentId,
        refundedAt: new Date(),
      },
    });

    // ✅ Final refund complete event
    io.to(order.buyerId).emit("order:refunded", order);

    res.status(200).json({ success: true, message: "Refund successful", refund, order });
  } catch (err) {
    console.error("❌ Refund failed:", err.message);

    // 🔴 Emit refund failure event
    const io = req.app.get("io");
    if (req.body?.orderId) {
      io.to(req.body.orderId).emit("order:refundFailed", {
        orderId: req.body.orderId,
        error: err.message,
      });
    }

    res.status(500).json({ error: "Refund failed", details: err.message });
  }
};



const autoCompleteAcceptedOrders = async (io) => {
  if (!CRON_ENABLED) return; // 🛑 Respect maintenance toggle

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const autoCompleteReason = "Auto-completed after 7 days of acceptance";

  const orders = await Order.find({
    status: "ACCEPTED",
    acceptedAt: { $lt: sevenDaysAgo },
    completedAt: null,
  });

  for (const order of orders) {
    order.status = "COMPLETED";
    order.completedAt = new Date();
    await order.save();

    if (io) {
      io.to(order.buyerId).emit("order:statusChanged", {
        orderId: order._id,
        status: "COMPLETED",
        updatedAt: order.updatedAt,
      });
      io.to(order.sellerId).emit("order:statusChanged", {
        orderId: order._id,
        status: "COMPLETED",
        updatedAt: order.updatedAt,
      });
    }

    await AdminAction.create({
      adminAppwriteId: "system",
      actionType: "ORDER_AUTO_COMPLETED",
      affectedId: order._id,
      description: autoCompleteReason,
      metadata: {
        autoCompletedAt: new Date(),
        acceptedAt: order.acceptedAt,
      },
    });

    await OrderActivityLog.create({
      orderId: order._id,
      actorId: "system",
      action: "ORDER_AUTO_COMPLETED",
      remarks: autoCompleteReason,
    });

  }

  console.log(`✅ Auto-completed ${orders.length} accepted orders after 7 days`);
};

const registerAutoCompleteCron = (io) => {
  cron.schedule("*/30 * * * *", async () => {
    console.log("⏰ Running auto-complete accepted orders...");
    await autoCompleteAcceptedOrders(io);
  });
};

// Toggle cron from admin panel (runtime switch)
const toggleCron = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { enabled } = req.body;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "Boolean 'enabled' required" });
    }

    CRON_ENABLED = enabled; // ✅ update the outer variable, do NOT use 'const'
    res.json({
      success: true,
      message: `Cron ${enabled ? "enabled" : "disabled"}`,
      currentStatus: CRON_ENABLED,
    });
  } catch (err) {
    console.error("Toggle cron error:", err);
    res.status(500).json({ error: "Failed to toggle cron" });
  }
};


module.exports = {
  placeOrder,
  respondToOrder,
  getMyOrders,
  getAllOrders,
  getOrderActivityLog,
  exportMultipleOrderLogsZip,
  getActivitySummary,
  getLogsByActor,
  cancelOrder,
  deleteOrderByAdmin,
  undoDeleteOrderByAdmin,
  getSoftDeletedOrders,
  exportDeletedOrdersZip,
  refundPayment,
  registerAutoCompleteCron,
  CRON_ENABLED,
  toggleCron
};
