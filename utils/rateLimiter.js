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

const RateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 mins
  message: {
    success: false,
    error: "Too many requests. Please try again later."
  }
});


module.exports = {
  logRateLimiter,
  RateLimiter
};
