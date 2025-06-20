// controllers/admin/userActivity.js
const { UserActivityLog } = require("../../models/admin");

const getRecentUserActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.activityType) filters.activityType = req.query.activityType;
    if (req.query.userId) filters.userId = req.query.userId;

    const logs = await UserActivityLog.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error("Failed to fetch user activity logs:", error);
    res.status(500).json({ error: "Server error while fetching logs" });
  }
};

const createUserActivityLog = async (activityData) => {
  try {
    const log = new UserActivityLog(activityData);
    await log.save();
  } catch (error) {
    console.error("Failed to save user activity log:", error.message);
  }
};

module.exports = {
  getRecentUserActivities,
  createUserActivityLog
};