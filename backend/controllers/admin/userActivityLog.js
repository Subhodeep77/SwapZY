// controllers/admin/userActivity.js
const { UserActivityLog } = require("../../models/Admin");

const getRecentUserActivities = async (req, res) => {
  try {
    console.log("the path is hit");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    console.log("req: ", req.query.userId);

    const filters = {};
    if (req.query.activityType) filters.activityType = req.query.activityType;
    if (req.query.userId) {
      filters.appwriteId = req.query.userId.trim().replace(/^'|'$/g, "");
    }
    console.log("filters: ", filters);

    const logs = await UserActivityLog.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, logs });
    console.log("logs: ", logs);
  } catch (error) {
    console.error("Failed to fetch user activity logs:", error);
    res.status(500).json({ error: "Server error while fetching logs" });
  }
};

const createUserActivityLog = async (activityData) => {
  try {
    const cleanedData = {
      ...activityData,
      appwriteId: activityData.appwriteId?.trim(), // remove accidental spaces
      activityType: activityData.activityType?.trim(), // just in case
    };

    const log = new UserActivityLog(cleanedData);
    await log.save();
  } catch (error) {
    console.error("Failed to save user activity log:", error.message);
  }
};

// 🔴 Delete all user activity logs
const deleteAllUserActivityLogs = async (req, res) => {
  try {
    await UserActivityLog.deleteMany({});
    res.status(200).json({ success: true, message: "All user activity logs deleted successfully" });
  } catch (error) {
    console.error("Failed to delete all user activity logs:", error);
    res.status(500).json({ error: "Server error while deleting logs" });
  }
};

// 🟢 Delete a specific log by ID
const deleteUserActivityLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLog = await UserActivityLog.findByIdAndDelete(id);

    if (!deletedLog) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    res.status(200).json({ success: true, message: "Log deleted successfully", deletedLog });
  } catch (error) {
    console.error("Failed to delete user activity log:", error);
    res.status(500).json({ error: "Server error while deleting log" });
  }
};

module.exports = {
  getRecentUserActivities,
  createUserActivityLog,
  deleteAllUserActivityLogs,
  deleteUserActivityLogById,
};
