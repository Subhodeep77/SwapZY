const express = require("express");
const router = express.Router();

const {
  getOrderActivityLog,
  getLogsByActor
} = require("../../controllers/order");

const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");
const { logRateLimiter } = require("../../utils/rateLimiter");

// 🔒 View activity log for a specific order
router.get("/:orderId", verifyAppwriteToken, getOrderActivityLog);

// 🔐 Admin view logs by actor (rate-limited)
router.get("/actor", verifyAppwriteToken, isAdmin, logRateLimiter, getLogsByActor);

module.exports = router;
