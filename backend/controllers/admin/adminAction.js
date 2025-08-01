// controllers/admin/adminAction.js
const { AdminAction } = require("../../models/Admin");

// 🧠 GET: Fetch recent admin actions with filters & pagination
const getRecentAdminActions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.actionType) filters.actionType = req.query.actionType;
    if (req.query.adminAppwriteId) filters.adminAppwriteId = req.query.adminAppwriteId;

    const actions = await AdminAction.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, actions });
  } catch (error) {
    console.error("Failed to fetch admin actions:", error.message);
    res.status(500).json({ error: "Server error fetching admin actions" });
  }
};

// 🧠 POST: Create a new admin action log
const createAdminAction = async (actionData) => {
  try {
    const action = new AdminAction(actionData);
    await action.save();
  } catch (error) {
    console.error("Failed to save admin action:", error.message);
  }
};

module.exports = {
  getRecentAdminActions,
  createAdminAction
};