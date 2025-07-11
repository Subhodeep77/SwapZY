// routes/user.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const { deleteUserAccount, initUserProfile, updateUserProfile } = require("../controllers/user");

// Just use default multer (no storage config needed)
const upload = multer(); 

router.use(verifyAppwriteToken);
router.post("/init", upload.single("avatar"), initUserProfile);
router.delete("/delete-account", deleteUserAccount);
router.post('/user/update', updateUserProfile);
console.log("Loaded user routes");
module.exports = router;
