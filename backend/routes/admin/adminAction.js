const express = require("express");
const router = express.Router();
const {
  getRecentAdminActions,
  createAdminAction
} = require("../../controllers/admin/adminAction");

const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");

// 🔐 GET: Recent admin actions
router.get("/", verifyAppwriteToken, isAdmin, getRecentAdminActions);

// 🔐 POST: Log new admin action
router.post("/", verifyAppwriteToken, isAdmin, async (req, res) => {
  try {
    await createAdminAction(req.body);
    res.status(201).json({ success: true, message: "Admin action logged" });
  } catch (error) {
    console.error("Failed to create admin action:", error.message);
    res.status(500).json({ error: "Failed to log admin action" });
  }
});

module.exports = router;
