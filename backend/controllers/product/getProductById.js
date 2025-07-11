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

    // 📦 Fetch the product
    const product = await Product.findById(productId).lean();

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // ✅ Restrict access to sold/expired items unless it's user's own
    if (product.status !== "available" && currentUserId !== product.ownerId) {
      return res.status(404).json({ error: "Product is not available." });
    }

    // 👁️ add user ids to views  (non-owner only)
    const viewerId = req.user?.appwriteId || req.ip;

    if (!product.views.includes(viewerId) && viewerId !== product.ownerId) {
      await Product.findByIdAndUpdate(productId, {
        $addToSet: { views: viewerId },
      });
    }
 
    // 📊 Get wishlist count
    const wishlistCount = await Wishlist.countDocuments({ productId });

    // 📌 Check if this user has wishlisted the product
    let isWishlisted = false;
    if (currentUserId) {
      const found = await Wishlist.findOne({
        userId: currentUserId,
        productId,
      });
      isWishlisted = !!found;
    }

    // ✅ Enrich and return
    const enriched = {
      ...product,
      isMine: currentUserId === product.ownerId,
      isWishlisted,
      wishlistCount,
      images: product.images || [],
      totalViews: (product.views || []).length,
    };

    return res.status(200).json({ product: enriched });
  } catch (err) {
    console.error("Error fetching product by ID:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
};

module.exports = { getProductById };
