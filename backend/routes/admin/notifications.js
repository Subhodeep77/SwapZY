// routes/admin/notifications.js
const express = require("express");
const router = express.Router();
const { Notification } = require("../../models/admin");
const isAdmin = require("../../middlewares/isAdmin");
const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");

// GET all admin notifications
router.get("/", verifyAppwriteToken, isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH to mark a notification as read
router.patch("/:id", verifyAppwriteToken, isAdmin, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

module.exports = router;
