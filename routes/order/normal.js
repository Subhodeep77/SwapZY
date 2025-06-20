const express = require("express");
const router = express.Router();

const {
  placeOrder,
  respondToOrder,
  getMyOrders,
  getAllOrders
} = require("../../controllers/order");

const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");

// 🛒 Place a new order
router.post("/", verifyAppwriteToken, placeOrder);

// 📦 Seller responds to order
router.patch("/:orderId/respond", verifyAppwriteToken, respondToOrder);

// 📜 Buyer or seller views their orders
router.get("/my", verifyAppwriteToken, getMyOrders);

// 🔐 Admin fetches all orders
router.get("/all", verifyAppwriteToken, isAdmin, getAllOrders);

module.exports = router;
