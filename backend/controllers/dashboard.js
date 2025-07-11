const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");

async function getDashboard(req, res) {
  try {
    const userId = req.user.appwriteId;

    // Basic Product Metrics
    const [totalProducts, availableProducts, soldProducts, expiredProducts] = await Promise.all([
      Product.countDocuments({ ownerId: userId }),
      Product.countDocuments({ ownerId: userId, status: "available" }),
      Product.countDocuments({ ownerId: userId, status: "sold" }),
      Product.countDocuments({ ownerId: userId, status: "expired" }),
    ]);

    // Wishlist Metrics
    const totalWishlistedByUser = await Wishlist.countDocuments({ userId });

    // Most Wishlisted Product Owned by User (Optimized Aggregation)
    const mostWishlistedProduct = await Wishlist.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { "product.ownerId": userId } },
      {
        $group: {
          _id: "$productId",
          count: { $sum: 1 },
          product: { $first: "$product" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    // Recent 5 Uploaded Products
    const recentUploads = await Product.find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Total Product Views
    const totalViews = await Product.aggregate([
      { $match: { ownerId: userId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    // Group Products by Category
    const categoryBreakdown = await Product.aggregate([
      { $match: { ownerId: userId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent Wishlist Activity (Last 5 wishlisted products by this user)
    const recentWishlistRaw = await Wishlist.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("productId")
      .lean();

    const recentWishlist = recentWishlistRaw
      .filter(entry => entry.productId) // skip deleted products
      .map(entry => ({
        _id: entry._id,
        product: entry.productId,
        addedAt: entry.createdAt,
      }));

    res.json({
      user: {
        name: req.user.name,
        email: req.user.email,
        appwriteId: userId,
      },
      productStats: {
        total: totalProducts,
        available: availableProducts,
        sold: soldProducts,
        expired: expiredProducts,
        views: totalViews[0]?.totalViews || 0,
        recentUploads,
        categoryBreakdown,
      },
      wishlistStats: {
        totalWishlistedByUser,
        mostWishlistedOwnedProduct: mostWishlistedProduct[0]?.product || null,
        recentWishlist,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getDashboard };
