// src/routes/auth.route.js
const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/auth");
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");

// Protected route example
router.get("/profile", verifyAppwriteToken, getProfile);
//router.all("*", (_req, res) => {res.status(404).json({ error: "Route not found" });});
console.log("Loaded auth routes");
module.exports = router;
