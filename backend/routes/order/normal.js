const express = require("express");
const router = express.Router();

const {
  placeOrder,
  respondToOrder,
  getMyOrders,
  getAllOrders,
  cancelOrder,
  deleteOrderByAdmin,
  undoDeleteOrderByAdmin,
  getSoftDeletedOrders,
  exportDeletedOrdersZip,
  refundPayment,
  toggleCron
} = require("../../controllers/order");

const { rateLimiter, refundLimiter } = require("../../utils/rateLimiter");

const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");

// 🛒 Place a new order
router.post("/", verifyAppwriteToken, placeOrder);

// 📦 Seller responds to order (accept/reject)
router.patch("/:orderId/respond", verifyAppwriteToken, respondToOrder);

// 🔙 Cancel order (buyer/seller only, PENDING only)
router.patch("/:orderId/cancel", verifyAppwriteToken, cancelOrder);

// 📜 Buyer or seller views their orders (supports pagination, filters including status=CANCELLED)
router.get("/my", verifyAppwriteToken, getMyOrders);

// 🔐 Admin fetches all orders (pagination, filters)
router.get("/all", verifyAppwriteToken, isAdmin, getAllOrders);

// 🛑 Admin deletes order
router.delete("/:orderId", verifyAppwriteToken, isAdmin, deleteOrderByAdmin);
router.post("/:orderId/restore", verifyAppwriteToken, isAdmin, undoDeleteOrderByAdmin);
router.get("/deleted", verifyAppwriteToken, isAdmin, getSoftDeletedOrders);
router.get("/deleted-orders/zip", verifyAppwriteToken, isAdmin, rateLimiter, exportDeletedOrdersZip);
router.post("/refund", verifyAppwriteToken, isAdmin, refundLimiter, refundPayment);
router.post("/admin/toggle-cron", isAdmin, toggleCron);

module.exports = router;
