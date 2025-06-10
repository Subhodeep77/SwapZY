const Product = require("../../models/Product");

async function getMyProducts(req, res) {
  try {
    const ownerId = req.user?.appwriteId || null;
    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      page = 1,
      limit = 10,
      sort,
      status = "available", // optional override
    } = req.query;

    const safePage = Math.max(1, parseInt(page));
    const safeLimit = Math.max(1, parseInt(limit));

    const filters = { ownerId };
    if (status !== "all") {
      filters.status = status;
    }

    const validSorts = ["latest", "price_low", "price_high"];
    let sortOption = { createdAt: -1 };
    if (sort === "price_low") sortOption = { price: 1 };
    else if (sort === "price_high") sortOption = { price: -1 };

    const skip = (safePage - 1) * safeLimit;

    const [products, total] = await Promise.all([
      Product.find(filters)
        .sort(sortOption)
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Product.countDocuments(filters),
    ]);

    const enriched = products.map((product) => ({
      ...product,
      canEdit: true,
      canDelete: true,
    }));

    return res.status(200).json({
      products: enriched,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
      message: products.length === 0 ? "You have no products listed." : undefined,
    });
  } catch (err) {
    console.error("Get my products error:", err);
    return res.status(500).json({ error: "Failed to fetch your products." });
  }
}

module.exports = { getMyProducts };
