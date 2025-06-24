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


module.exports = {
  logRateLimiter,
  rateLimiter,
  getMessagesLimiter
};
