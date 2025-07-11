// routes/admin/auditLog.js
const express = require("express");
const router = express.Router();
const { getAllAuditLogs, createAuditLog } = require("../../controllers/admin/auditLog");
const isAdmin = require("../../middlewares/isAdmin");
const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");

// GET: Fetch recent audit logs
router.get("/", verifyAppwriteToken, isAdmin, getAllAuditLogs);

// POST: Create a new audit log manually (for admin testing or internal use)
router.post("/", verifyAppwriteToken, isAdmin, async (req, res) => {
  try {
    await createAuditLog(req.body);
    res.status(201).json({ success: true, message: "Audit log created" });
  } catch (error) {
    console.error("Audit log creation error:", error);
    res.status(500).json({ error: "Failed to create audit log" });
  }
});

module.exports = router;
