const express = require("express");
const router = express.Router();
const { addToWishlist, removeFromWishlist, getMyWishlist } = require("../controllers/wishlist");
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const { addToWishlistLimiter, getWishlistLimiter } = require("../middlewares/rateLimiter");

// All routes require user to be logged in
router.use(verifyAppwriteToken);
// Add to wishlist
router.post("/", addToWishlistLimiter, addToWishlist);

// Remove from wishlist
router.delete("/:productId", addToWishlistLimiter, removeFromWishlist);

// Get current user's wishlist
router.get("/", getWishlistLimiter, getMyWishlist);

console.log("Loaded wishlist routes");
module.exports = router;
