const express = require("express");
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require("../controllers/wishlist/wishlistController");
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");

// All routes require user to be logged in
router.use(verifyAppwriteToken);

// Add to wishlist
router.post("/", addToWishlist);

// Remove from wishlist
router.delete("/:productId", removeFromWishlist);

// Get current user's wishlist
router.get("/", getWishlist);

module.exports = router;
