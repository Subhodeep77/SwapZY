const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    // Fetch distinct non-empty categories
    const rawCategories = await Product.distinct("category", { category: { $ne: "" } });

    // Normalize: trim whitespace, capitalize first letter, and remove duplicates
    const normalized = rawCategories
      .map(c => c.trim())
      .filter(c => c !== "")
      .map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase());

    // Remove duplicates and sort alphabetically
    const categories = [...new Set(normalized)].sort();

    res.status(200).json({ categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

console.log("Loaded category routes");

module.exports = router;
