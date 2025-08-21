const express = require("express");
const router = express.Router();

const isAdmin = require("../../middlewares/isAdmin");
const verifyAppwriteToken = require("../../middlewares/verifyAppwriteToken");

const {
  getAllUsers,
  getUserDetailsByAppwriteId,
  updateUserByAdmin,
  softDeleteUserByAppwriteId,
  restoreUserByAppwriteId
} = require("../../controllers/admin/userManagement");

// ✅ Get all users (paginated)
router.get("/", verifyAppwriteToken, isAdmin, getAllUsers);

// ✅ Get a specific user's details
router.get("/:appwriteId", verifyAppwriteToken, isAdmin, getUserDetailsByAppwriteId);

// ✅ Admin can update any user's fields (including role and isDeleted)
router.patch("/:appwriteId", verifyAppwriteToken, isAdmin, updateUserByAdmin);

// ✅ Soft-delete a user
router.patch("/:appwriteId/soft-delete", verifyAppwriteToken, isAdmin, softDeleteUserByAppwriteId);

// ✅ Restore a soft-deleted user
router.patch("/:appwriteId/restore", verifyAppwriteToken, isAdmin, restoreUserByAppwriteId);

module.exports = router;
