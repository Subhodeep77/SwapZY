const Product = require("../../models/Product");

async function getMyProducts(req, res) {
  try {
    const ownerId = req.user.appwriteId;

    const products = await Product.find({ ownerId, status: "available" }).sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.status(200).json({
        products: [],
        message: "You have no products listed.",
      });
    }

    res.status(200).json({ products });
  } catch (err) {
    console.error("Get my products error:", err);
    res.status(500).json({ error: "Failed to fetch your products." });
  }
}

module.exports = { getMyProducts };
