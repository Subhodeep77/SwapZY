// routes/admin/adminLoginLog.js
const express = require("express");
const router = express.Router();
const { createAdminAction } = require("../../controllers/admin/adminAction");
const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");

router.post("/log", verifyAppwriteToken, isAdmin, async (req, res) => {
  try {
    const { $id: adminAppwriteId } = req.user;

    await createAdminAction({
      adminAppwriteId,
      actionType: "ADMIN_LOGIN",
      description: "Admin logged in",
      affectedId: adminAppwriteId,
    });

    res.status(201).json({ success: true, message: "Admin login recorded" });
  } catch (error) {
    console.error("Failed to log admin login:", error.message);
    res.status(500).json({ error: "Failed to log admin login" });
  }
});

// routes/admin/adminLoginLog.js (continued)
router.post("/log-logout", verifyAppwriteToken, isAdmin, async (req, res) => {
  try {
    const { $id: adminAppwriteId } = req.user;

    await createAdminAction({
      adminAppwriteId,
      actionType: "ADMIN_LOGOUT",
      description: "Admin logged out",
      affectedId: adminAppwriteId,
    });

    res.status(201).json({ success: true, message: "Admin logout recorded" });
  } catch (error) {
    console.error("Failed to log admin logout:", error.message);
    res.status(500).json({ error: "Failed to log admin logout" });
  }
});

module.exports = router;
