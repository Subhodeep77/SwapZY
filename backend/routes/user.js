const express = require("express");
const router = express.Router();
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");

// Controllers
const {
  initUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserByAppwriteId
} = require("../controllers/user");

// Middleware to verify JWT
router.use(verifyAppwriteToken);

// Init user (auto-avatar generation)
router.post("/init", initUserProfile);

// Update profile (auto-avatar if needed)
router.post("/update", updateUserProfile);

// Delete user
router.delete("/delete-account", deleteUserAccount);

// Get own user info
router.get("/me", async (req, res) => {
  try {
    const appwriteId = req.user.appwriteId;
    const user = await getUserByAppwriteId(req.user.jwt, appwriteId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

console.log("Loaded user routes");

module.exports = router;
