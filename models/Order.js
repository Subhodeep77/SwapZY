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
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: String, // Appwrite user ID of admin
    default: null
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
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// 📌 Indexes for fast querying
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ isDeleted: 1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;


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

// 📌 Indexes
orderActivityLogSchema.index({ orderId: 1 });
orderActivityLogSchema.index({ actorId: 1, action: 1 });

const OrderActivityLog = mongoose.model("OrderActivityLog", orderActivityLogSchema);


module.exports = {
  Order,
  OrderActivityLog
};

