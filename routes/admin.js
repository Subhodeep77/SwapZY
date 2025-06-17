const express = require("express");
const router = express.Router();
const isAdmin = require("../middlewares/isAdmin");
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const {
  getAllUsers,
  getUserDetailsByAppwriteId,
  updateUserByAdmin,
  softDeleteUserByAppwriteId
} = require("../controllers/admin");

// ✅ Route to fetch all users
router.get("/users", verifyAppwriteToken, isAdmin, getAllUsers);

// ✅ Route to fetch a specific user by appwriteId
router.get("/users/:appwriteId", verifyAppwriteToken, isAdmin, getUserDetailsByAppwriteId);

router.patch("/user/:appwriteId/role", verifyAppwriteToken, isAdmin, updateUserByAdmin);

router.patch("/users/:appwriteId/soft-delete", verifyAppwriteToken, isAdmin, softDeleteUserByAppwriteId);

module.exports = router;
