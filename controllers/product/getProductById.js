const Product = require("../../models/Product");
const Wishlist = require("../../models/Wishlist");

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // ✅ Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      return res.status(400).json({ error: "Invalid product ID format." });
    }

    const currentUserId = req.user?.appwriteId;

    // ⚡ Use lean() for faster read & smaller payload
    const product = await Product.findById(productId).lean();

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // ✅ Restrict access to sold/expired items unless it's user's own
    if (product.status !== "available" && currentUserId !== product.ownerId) {
      return res.status(404).json({ error: "Product is not available." });
    }

    // 📊 Get wishlist count
    const wishlistCount = await Wishlist.countDocuments({ productId });

    // 📌 Find which products this user has wishlisted
    let wishlistedIds = [];
    if (currentUserId) {
      const wishlistEntries = await Wishlist.find({
        userId: currentUserId,
      }).select("productId");
      wishlistedIds = wishlistEntries.map((entry) =>
        entry.productId.toString()
      );
    }

    // ✅ Enrich and return
    const enriched = products.map((product) => ({
      ...product,
      isMine: currentUserId === product.ownerId,
      isWishlisted: wishlistedIds.includes(product._id.toString()),
      wishlistCount,
      images: product.images || [],
    }));

    return res.status(200).json({ product: enriched });
  } catch (err) {
    console.error("Error fetching product by ID:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
};

module.exports = { getProductById };
