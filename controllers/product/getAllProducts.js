const Product = require("../../models/Product");

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
      status: "available", // ✅ Only show available products
    };

    // 🔍 Full-text-like search (safe)
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

    // 🔃 Sorting logic with fallback
    const validSorts = ["latest", "price_low", "price_high"];
    let sortOption = {};
    if (sort === "latest") sortOption = { createdAt: -1 };
    else if (sort === "price_low") sortOption = { price: 1 };
    else if (sort === "price_high") sortOption = { price: -1 };
    else if (!validSorts.includes(sort)) sortOption = { createdAt: -1 };

    const skip = (safePage - 1) * safeLimit;

    // 🛠 Debug (Optional, remove in production)
    console.log("Query filters:", filters);
    console.log("Sort:", sortOption);

    // ⚡ Use .lean() for performance
    const [products, total] = await Promise.all([
      Product.find(filters)
        .lean()
        .sort(sortOption)
        .skip(skip)
        .limit(safeLimit),
      Product.countDocuments(filters),
    ]);

    // 🧠 Mark product as mine if the ownerId matches
    const enriched = products.map((product) => ({
      ...product,
      isMine: currentUserId ? product.ownerId === currentUserId : false,
    }));

    // 📭 Optional UX: No products found message
    if (products.length === 0) {
      return res.status(200).json({
        message: "No products found",
        products: [],
        total: 0,
        page: safePage,
        limit: safeLimit,
        totalPages: 0,
      });
    }

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
