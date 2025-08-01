// controllers/admin/auditLog.js
const { AuditLog, Notification } = require("../../models/Admin");

const getAllAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.actionType) filters.actionType = req.query.actionType;
    if (req.query.performedBy) filters.performedBy = req.query.performedBy;

    const logs = await AuditLog.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error("Audit log fetch error:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

const createAuditLog = async (logData) => {
  try {
    const log = new AuditLog(logData);
    await log.save();

    if (["USER_BANNED", "MASS_DELETE"].includes(logData.actionType)) {
      const message = `🔔 ${logData.actionType.replace("_", " ")} by Admin: ${logData.performedBy}`;
      await Notification.create({ message, type: "CRITICAL" });
    }
  } catch (error) {
    console.error("Failed to save audit log:", error.message);
  }
};

module.exports = { createAuditLog, getAllAuditLogs };
