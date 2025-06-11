const Product = require("../../models/Product");
const Wishlist = require("../../models/Wishlist");

async function getAllProducts(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      condition,
      sort,
      search,
    } = req.query;

    const currentUserId = req.user?.appwriteId || null;

    const safePage = Math.max(1, parseInt(page));
    const safeLimit = Math.max(1, parseInt(limit));

    const filters = {
      status: "available",
    };

    if (search?.trim()) {
      const keyword = search.trim();
      filters.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (category) filters.category = category;
    if (condition) filters.condition = condition;

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const validSorts = ["latest", "price_low", "price_high"];
    let sortOption = {};
    if (sort === "latest") sortOption = { createdAt: -1 };
    else if (sort === "price_low") sortOption = { price: 1 };
    else if (sort === "price_high") sortOption = { price: -1 };
    else if (!validSorts.includes(sort)) sortOption = { createdAt: -1 };

    const skip = (safePage - 1) * safeLimit;

    const [products, total] = await Promise.all([
      Product.find(filters).lean().sort(sortOption).skip(skip).limit(safeLimit),
      Product.countDocuments(filters),
    ]);

    const productIds = products.map((p) => p._id);

    // Fetch wishlist entries for the fetched products
    const wishlistEntries = await Wishlist.find({
      productId: { $in: productIds },
    }).select("productId userId");

    const wishlistCountMap = {};
    const wishlistedIds = new Set();

    wishlistEntries.forEach((entry) => {
      const id = entry.productId.toString();
      wishlistCountMap[id] = (wishlistCountMap[id] || 0) + 1;
      if (entry.userId.toString() === currentUserId) {
        wishlistedIds.add(id);
      }
    });

    const enriched = products.map((product) => ({
      ...product,
      isMine: currentUserId ? product.ownerId === currentUserId : false,
      isWishlisted: wishlistedIds.has(product._id.toString()),
      wishlistCount: wishlistCountMap[product._id.toString()] || 0,
    }));

    return res.status(200).json({
      products: enriched,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    });
  } catch (err) {
    console.error("Get all products error:", err);
    return res.status(500).json({ error: "Failed to fetch products." });
  }
}

module.exports = { getAllProducts };
