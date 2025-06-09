const Product = require("../../models/Product");

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // ✅ Validate MongoDB ObjectId format
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid product ID format." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // ✅ If product is not available, restrict guest view
    if (product.status !== "available") {
      // allow owner to view their own sold/expired item
      if (!req.user || req.user.appwriteId !== product.ownerId) {
        return res.status(404).json({ error: "Product is not available." });
      }
    }

    const isMine = req.user?.appwriteId === product.ownerId;

    res.status(200).json({ product, isMine });
  } catch (err) {
    console.error("Error fetching product by ID:", err.message);
    res.status(500).json({ error: "Server error." });
  }
};

module.exports = { getProductById };
