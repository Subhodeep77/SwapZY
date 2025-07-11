const express = require("express");
const router = express.Router();

const {
  getOrderActivityLog,
  getLogsByActor,
  exportMultipleOrderLogsZip,
  getActivitySummary
} = require("../../controllers/order");

const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");
const { logRateLimiter } = require("../../utils/rateLimiter");

// 🔐 Admin view logs by actor (rate-limited)
router.get("/actor", verifyAppwriteToken, isAdmin, logRateLimiter, getLogsByActor);

// 📊 Summary chart (user/order)
router.get("/summary", verifyAppwriteToken, getActivitySummary);

// 📁 Export CSV (admin or self)
// routes/order/orderActivityLog.js
router.post("/export-multiple", verifyAppwriteToken, isAdmin, exportMultipleOrderLogsZip);

// 🔍 View activity log for a specific order
router.get("/:orderId", verifyAppwriteToken, getOrderActivityLog);

module.exports = router;
