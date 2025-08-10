// utils/rateLimiters.js
const rateLimit = require("express-rate-limit");

const logRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 mins
  message: {
    success: false,
    error: "Too many requests. Please try again later."
  }
});

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 mins
  message: {
    success: false,
    error: "Too many requests. Please try again later."
  }
});

const getMessagesLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 5,
  message: "Too many requests for chat messages. Please slow down.",
});

const refundLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // max 3 refunds per minute per IP (or can be token-based if needed)
  message: { error: "Too many refund requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: { message: "Too many requests, please try again later." }
});


module.exports = {
  logRateLimiter,
  rateLimiter,
  getMessagesLimiter,
  refundLimiter,
  userLimiter
};
