// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const buyerId = req.user.appwriteId;
    const { productId, amount = 0, notes = "", deliveryInfo = "", chatId = null } = req.body;

    const existingOrdersToday = await Order.countDocuments({
      buyerId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingOrdersToday >= 5) {
      return res.status(429).json({ error: "Daily order limit reached (5 per day)" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.ownerId === buyerId) return res.status(400).json({ error: "You cannot order your own product" });

    const order = await Order.create({
      productId,
      buyerId,
      sellerId: product.ownerId,
      amount,
      notes,
      deliveryInfo,
      chatId
    });

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
    const { action } = req.body; // 'ACCEPTED' or 'REJECTED'
    const sellerId = req.user.appwriteId;

    const order = await Order.findById(orderId);
    if (!order || order.sellerId !== sellerId) {
      return res.status(404).json({ error: "Order not found or access denied" });
    }

    if (!["ACCEPTED", "REJECTED"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    order.status = action;
    if (action === "ACCEPTED") order.acceptedAt = new Date();
    await order.save();

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
        totalPages: Math.ceil(total / limit)
      }
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
      filters.$or = [
        { buyerId: userId },
        { sellerId: userId }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(filters)
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Admin fetch orders error:", error.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};


const OrderActivityLog = require("../models/Order").OrderActivityLog;

// 🧾 Get activity logs for a specific order
const getOrderActivityLog = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action, page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const query = { orderId };
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
      OrderActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      OrderActivityLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Fetch order activity log error:", error);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
};

// 🔐 Admin: Get activity logs by actorId (with optional action filter)
const getLogsByActor = async (req, res) => {
  try {
    const { actorId, action, page = 1, limit = 20 } = req.query;

    if (!actorId) {
      return res.status(400).json({ error: "actorId is required" });
    }

    const skip = (page - 1) * limit;
    const query = { actorId };
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
      OrderActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      OrderActivityLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Fetch logs by actor error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};


module.exports = {
  placeOrder,
  respondToOrder,
  getMyOrders,
  getAllOrders,
  getOrderActivityLog,
  getLogsByActor
};
