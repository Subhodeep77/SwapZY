const express = require("express");
const router = express.Router();
const {
  initUser,
  updateUser,
  getUserByAppwriteId,
  softDeleteUser,
  restoreUser,
  deleteUser,
} = require("../controllers/user");
const upload = require("../middlewares/cloudinaryUploader");
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const isAdmin = require("../middlewares/isAdmin");

router.use(verifyAppwriteToken)
router.post("/init", upload.single("avatar"), (req, res) => {
  console.log("🔥 /init route hit");
  console.log("📦 Request body:", req.body);
  console.log("🖼️ Uploaded avatar file:", req.file);
  initUser(req,res);
});

router.put("/user/update", upload.single("avatar"), updateUser);

router.get("/:appwriteId", getUserByAppwriteId);

router.delete("/:appwriteId", isAdmin, softDeleteUser);

router.patch("/restore/:appwriteId", isAdmin, restoreUser);

router.delete("/hard/:appwriteId", deleteUser);

console.log('Loaded user routes');

module.exports = router;
