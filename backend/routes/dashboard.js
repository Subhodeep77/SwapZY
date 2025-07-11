const express = require("express");
const router = express.Router();

const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const { getDashboard } = require("../controllers/dashboard");

router.get("/", verifyAppwriteToken, getDashboard);

console.log("Loaded dashboard routes");
module.exports = router;
