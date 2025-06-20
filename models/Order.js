// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true // 📌 Indexed for product-based queries
  },
  buyerId: {
    type: String,
    required: true,
    index: true // 📌 Indexed for buyer history
  },
  sellerId: {
    type: String,
    required: true,
    index: true // 📌 Indexed for seller-specific queries
  },
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
    default: "PENDING",
    index: true // 📌 For filtering by status
  },
  amount: {
    type: Number,
    default: 0
  },
  chatId: {
    type: String,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ["PAID", "PENDING"],
    default: "PENDING"
  },
  notes: {
    type: String,
    default: ""
  },
  deliveryInfo: {
    type: String, // You can change this to an object if needed later
    default: ""
  }
}, {
  timestamps: true
});

// 📌 Add compound index for seller + status to support seller filtering
orderSchema.index({ sellerId: 1, status: 1 });

// 📌 Add compound index for buyer + status to support buyer filtering
orderSchema.index({ buyerId: 1, status: 1 });

const Order = mongoose.model("Order", orderSchema);

// models/OrderActivityLog.js
const orderActivityLogSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  actorId: {
    type: String, // Appwrite user ID of buyer, seller, or admin
    required: true
  },
  action: {
    type: String, // e.g., 'ORDER_PLACED', 'ORDER_ACCEPTED', etc.
    required: true
  },
  remarks: {
    type: String,
    default: ""
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

orderActivityLogSchema.index({ orderId: 1 });
orderActivityLogSchema.index({ actorId: 1, action: 1 });

const OrderActivityLog = mongoose.model("OrderActivityLog", orderActivityLogSchema);

module.exports = {
  Order,
  OrderActivityLog
};
