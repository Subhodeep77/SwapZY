// routes/user.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const { deleteUserAccount, initUserProfile, updateUserProfile, getUserByAppwriteId } = require("../controllers/user");

// Just use default multer (no storage config needed)
const upload = multer(); 

router.use(verifyAppwriteToken);
router.post("/init", upload.single("avatar"), initUserProfile);
router.delete("/delete-account", deleteUserAccount);
router.post('/update', updateUserProfile);
router.get("/me", async (req, res) => {
  try {
    const appwriteId = req.user.appwriteId;
    const user = await getUserByAppwriteId(appwriteId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
console.log("Loaded user routes");
module.exports = router;
