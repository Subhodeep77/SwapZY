const express = require("express");
const router = express.Router();

const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const { getDashboard } = require("../controllers/dashboard");

router.get("/", verifyAppwriteToken, getDashboard);

//router.all("*", (_req, res) => {res.status(404).json({ error: "Route not found" });});
console.log("Loaded dashboard routes");
module.exports = router;
