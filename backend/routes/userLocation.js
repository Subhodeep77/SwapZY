const express = require("express");
const axios = require("axios");
const router = express.Router();
const Product = require("../models/Product");

const ipCache = new Map(); // ⏳ IP-based cache
const ipRateLimit = new Map(); // 🚫 Basic IP-based rate limit
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_INTERVAL = 30 * 1000; // 30 seconds per IP

// GET /api/user-location?userId=APPWRITE_ID
router.get("/", async (req, res) => {
  const { userId } = req.query;

  try {
    // 🧠 When userId is provided → fetch from Product model
    if (userId) {
      const latestProduct = await Product.findOne({ ownerId: userId })
        .sort({ createdAt: -1 })
        .select("college city district state");

      if (!latestProduct) {
        return res.status(404).json({ error: "No product found for user" });
      }

      const { college, city, district, state } = latestProduct;

      return res.json({
        college,
        city,
        district: district || null,
        state,
        source: "product-model",
      });
    }

    // 🌐 Get IP from headers/socket
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;
    const clientIp = ip === "::1" || ip === "127.0.0.1" ? "8.8.8.8" : ip;

    // 🚫 Check basic rate limit
    const lastReqTime = ipRateLimit.get(clientIp);
    const now = Date.now();
    if (lastReqTime && now - lastReqTime < RATE_LIMIT_INTERVAL) {
      return res
        .status(429)
        .json({ error: "Too many requests. Please wait a moment." });
    }
    ipRateLimit.set(clientIp, now);

    // ✅ Use cache if available and not expired
    const cached = ipCache.get(clientIp);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return res.json({ ...cached.data, source: "ip-cache" });
    }

    // 🌍 Call external IP geolocation API
    const geoRes = await axios.get(`https://ipapi.co/${clientIp}/json/`);
    const { city, region: state, country_name } = geoRes.data;

    const locationData = {
      college: null,
      city: city || null,
      district: null,
      state: state || null,
      country: country_name || null,
    };

    // 💾 Store in cache
    ipCache.set(clientIp, { data: locationData, timestamp: now });

    return res.json({ ...locationData, source: "ip-geolocation" });
  } catch (err) {
    console.error("Error in /api/user-location:", err.message);
    res.status(500).json({ error: "Failed to determine user location" });
  }
});

console.log("Loaded user location routes");

module.exports = router;
