// controllers/admin/auditLog.js
const { AuditLog, Notification } = require("../../models/Admin");

const getAllAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.action) {
      filters.action = { $regex: new RegExp(`^${req.query.action}$`, "i") };
    }
    if (req.query.actorAppwriteId) {
      filters.actorAppwriteId = { $regex: new RegExp(`^${req.query.actorAppwriteId}$`, "i") };
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filters)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filters),
    ]);

    res.status(200).json({ success: true, logs, total, page, limit });
  } catch (error) {
    console.error("Audit log fetch error:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

const createAuditLog = async (logData, req) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress ||
      "";
    const userAgent = req.headers["user-agent"] || "";
    const log = new AuditLog({
      ...logData,
      ip,
      userAgent,
      timestamp: new Date(),
    });
    await log.save();

    if (["USER_BANNED", "MASS_DELETE", "USER_RESTORED"].includes(logData.action)) {
      const message = `🔔 ${logData.actionType.replace("_", " ")} by Admin: ${logData.actorAppwriteId}`;
      await Notification.create({ message, type: "CRITICAL" });
    }
  } catch (error) {
    console.error("Failed to save audit log:", error.message);
  }
};

// ✅ Delete single audit log by ID
const deleteAuditLog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AuditLog.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Log not found" });
    }

    res.status(200).json({ success: true, message: "Audit log deleted" });
  } catch (error) {
    console.error("Audit log delete error:", error);
    res.status(500).json({ error: "Failed to delete audit log" });
  }
};

// ✅ Delete all logs (be careful!)
const deleteAllAuditLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    res.status(200).json({ success: true, message: "All audit logs deleted" });
  } catch (error) {
    console.error("Audit log bulk delete error:", error);
    res.status(500).json({ error: "Failed to delete audit logs" });
  }
};

module.exports = {
  createAuditLog,
  getAllAuditLogs,
  deleteAuditLog,
  deleteAllAuditLogs,
};
