// routes/admin/adminsRoutes.js
const router = require("express").Router();
const { getAllAdmins } = require("../../controllers/admin/admins");
const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");
const isAdmin = require("../../middlewares/isAdmin");

router.get("/", verifyAppwriteToken, isAdmin, getAllAdmins);
module.exports = router;
