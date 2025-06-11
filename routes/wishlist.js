const express = require("express");
const router = express.Router();
const { addToWishlist, removeFromWishlist, getMyWishlist } = require("../controllers/wishlist");
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");

// All routes require user to be logged in
router.use(verifyAppwriteToken);

// Add to wishlist
router.post("/", addToWishlist);

// Remove from wishlist
router.delete("/:productId", removeFromWishlist);

// Get current user's wishlist
router.get("/", getMyWishlist);

//router.all("*", (_req, res) => {res.status(404).json({ error: "Route not found" });});
console.log("Loaded wishlist routes");
module.exports = router;
