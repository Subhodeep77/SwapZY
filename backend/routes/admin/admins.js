const router = require("express").Router();
const { getAllAdmins } = require("../../controllers/admin/admins");
const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");

// GET /api/admin/admins/map — returns adminId to name mapping
router.get("/map", verifyAppwriteToken, isAdmin, getAllAdmins);

module.exports = router;
