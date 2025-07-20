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

// Add this to your /api/admin/admin-login-log route
router.get("/", verifyAppwriteToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      AdminAction.find({
        actionType: { $in: ["ADMIN_LOGIN", "ADMIN_LOGOUT"] },
      })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AdminAction.countDocuments({
        actionType: { $in: ["ADMIN_LOGIN", "ADMIN_LOGOUT"] },
      }),
    ]);

    res.json({
      logs,
      pagination: {
        page,
        totalPages: Math.ceil(totalCount / limit),
        total: totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching admin login logs:", error.message);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});



module.exports = router;
