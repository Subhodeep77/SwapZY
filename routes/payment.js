const express = require("express");
const router = express.Router();
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const { refundLimiter } = require("../utils/rateLimiter");

const {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
} = require("../controllers/payment");

// 💳 Initiate Razorpay Order
router.post("/initiate", verifyAppwriteToken, initiatePayment);

// ✅ Verify Razorpay Payment Signature
router.post("/verify", verifyAppwriteToken, verifyPayment);

// 📦 Get Payment / Refund Status for Order
router.get("/:orderId/status", verifyAppwriteToken, refundLimiter, getPaymentStatus);
// ⬆️ Limit to 3 requests per 60 seconds per user

console.log(`Loaded payment routes`);

module.exports = router;
