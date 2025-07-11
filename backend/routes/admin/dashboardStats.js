// routes/admin/dashboardStats.js
const express = require("express");
const router = express.Router();
const {
  getTodayStats,
  regenerateStatsManually,
  getLast7DaysStats,
} = require("../../controllers/admin/dashboardStats");
const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");

router.get("/", verifyAppwriteToken, isAdmin, getTodayStats);
router.post("/regenerate", verifyAppwriteToken, isAdmin, regenerateStatsManually);
router.get("/weekly", verifyAppwriteToken, isAdmin, getLast7DaysStats);

module.exports = router;
