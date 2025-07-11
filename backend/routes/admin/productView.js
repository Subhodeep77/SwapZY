const express = require("express");
const router = express.Router();

const {
  logProductView,
  getViewsByProduct
} = require("../../controllers/admin/productView");

const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");

// ✅ Public route to log a product view (with internal rate limiting)
router.post("/", logProductView);

// 🔐 Admin-only route to fetch views by productId
router.get("/:productId", verifyAppwriteToken, isAdmin, getViewsByProduct);

module.exports = router;
