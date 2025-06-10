const Product = require("../../models/Product");

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // ✅ Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      return res.status(400).json({ error: "Invalid product ID format." });
    }

    // ⚡ Use lean() for faster read & smaller payload
    const product = await Product.findById(productId).lean();

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const currentUserId = req.user?.appwriteId;

    // ✅ Restrict access to sold/expired items unless it's user's own
    if (product.status !== "available" && currentUserId !== product.ownerId) {
      return res.status(404).json({ error: "Product is not available." });
    }

    // ✅ Attach isMine and sanitize images
    const enriched = {
      ...product,
      isMine: currentUserId === product.ownerId,
      images: product.images || [],
    };

    return res.status(200).json({ product: enriched });
  } catch (err) {
    console.error("Error fetching product by ID:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
};

module.exports = { getProductById };
