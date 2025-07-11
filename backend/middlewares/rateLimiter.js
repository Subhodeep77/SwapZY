const rateLimit = require('express-rate-limit');

// 🌐 Global limiter: Limits each IP to 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 🆕 Per-route: Product creation - 5 per hour
const createProductLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "You can only create up to 5 products per hour.",
});

// 🆕 Per-route: Bulk upload - 2 per hour
const bulkUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 2,
  message: "You can only bulk upload 2 times per hour.",
});

// 🆕 Per-route: Bulk delete - 3 per hour
const bulkDeleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "You can only bulk delete 3 times per hour.",
});

// 🆕 Per-route: Update product - 10 updates per hour
const updateProductLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "You can only update products 10 times per hour.",
});

// 🆕 Per-route: Delete product - 5 deletes per hour
const deleteProductLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "You can only delete up to 5 products per hour.",
});

// 🆕 Per-route: Mark product status - 10 status updates per hour
const markStatusLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "You can only change product status 10 times per hour.",
});

const addToWishlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Max 30 add/remove actions per hour
  message: "Too many wishlist actions. Please slow down.",
});

const getWishlistLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  message: "Too many wishlist fetches. Try again later.",
});

module.exports = {
  globalLimiter,
  createProductLimiter,
  bulkUploadLimiter,
  bulkDeleteLimiter,
  updateProductLimiter,
  deleteProductLimiter,
  markStatusLimiter,
  addToWishlistLimiter,
  getWishlistLimiter
};
