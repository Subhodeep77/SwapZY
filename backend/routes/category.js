// routes/category.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    const categories = await Product.distinct("category", { category: { $ne: "" } });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

console.log(`Loaded category routes`)

module.exports = router;
