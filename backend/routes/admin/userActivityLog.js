const express = require("express");
const router = express.Router();
const {
  getRecentUserActivities,
  createUserActivityLog,
  deleteAllUserActivityLogs,
  deleteUserActivityLogById
} = require("../../controllers/admin/userActivityLog");

const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");

router.get("/", verifyAppwriteToken, isAdmin, getRecentUserActivities);

router.post("/create", verifyAppwriteToken, isAdmin, async (req, res) => {
  try {
    await createUserActivityLog(req.body);
    res.status(201).json({ success: true, message: "Activity log created" });
  } catch (error) {
    console.error("Activity log creation error:", error);
    res.status(500).json({ error: "Failed to create activity log" });
  }
});

router.delete("/", verifyAppwriteToken, isAdmin, deleteAllUserActivityLogs);

router.delete("/:id", verifyAppwriteToken, isAdmin, deleteUserActivityLogById);

module.exports = router;
