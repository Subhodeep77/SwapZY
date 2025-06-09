const express = require("express");
const router = express.Router();

const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const { getDashboard } = require("../controllers/dashboard");

router.get("/dashboard", verifyAppwriteToken, getDashboard);

module.exports = router;
