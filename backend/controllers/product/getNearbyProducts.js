const Product = require("../../models/Product");
const Wishlist = require("../../models/Wishlist");

const getNearbyProducts = async (req, res) => {
  try {
    const {
      lng,
      lat,
      college,
      city,
      district,
      state,
      page = 1,
      limit = 30,
      sort = "latest",
      minPrice,
      maxPrice,
      category,
      condition,
    } = req.query;

    const currentUserId = req.user?.appwriteId;

    // Validate required fields
    if (!lng || !lat || !college || !city || !state) {
      return res.status(400).json({ error: "Missing required location fields." });
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({ error: "Invalid coordinates." });
    }

    const userLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    // Dynamic sort mapping
    let sortOption = { createdAt: -1 }; // default
    if (sort === "priceLowToHigh") sortOption = { price: 1 };
    else if (sort === "priceHighToLow") sortOption = { price: -1 };

    // Base filter shared by all levels
    const baseFilter = { status: "available" };
    if (category) baseFilter.category = category;
    if (condition) baseFilter.condition = condition;
    if (minPrice || maxPrice) {
      baseFilter.price = {};
      if (minPrice) baseFilter.price.$gte = parseFloat(minPrice);
      if (maxPrice) baseFilter.price.$lte = parseFloat(maxPrice);
    }

    const searchLevels = [
      { filter: { college }, maxDistance: 5 * 1000 },
      { filter: { city }, maxDistance: 15 * 1000 },
      district ? { filter: { district }, maxDistance: 25 * 1000 } : null,
      { filter: { state }, maxDistance: 50 * 1000 },
      { filter: {}, maxDistance: 100 * 1000 },
    ].filter(Boolean);

    let allResults = new Map();

    for (const level of searchLevels) {
      const queryFilter = {
        ...baseFilter,
        ...level.filter,
      };

      const results = await Product.aggregate([
        {
          $geoNear: {
            near: userLocation,
            distanceField: "distance",
            maxDistance: level.maxDistance,
            spherical: true,
            query: queryFilter,
          },
        },
        { $sort: sortOption },
      ]);

      for (const product of results) {
        const id = product._id.toString();
        if (!allResults.has(id)) {
          allResults.set(id, product);
        }
      }
    }

    const mergedResults = Array.from(allResults.values());

    // Pagination
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = mergedResults.slice(start, start + parseInt(limit));

    // Wishlist enrichment
    const productIds = paginated.map((p) => p._id);
    const wishlistEntries = await Wishlist.find({
      productId: { $in: productIds },
    })
      .select("productId userId")
      .lean();

    const wishlistCountMap = {};
    const wishlistedIds = new Set();

    wishlistEntries.forEach((entry) => {
      const id = entry.productId.toString();
      wishlistCountMap[id] = (wishlistCountMap[id] || 0) + 1;
      if (entry.userId.toString() === currentUserId) {
        wishlistedIds.add(id);
      }
    });

    const enriched = paginated.map((product) => {
      const plain = product.toObject ? product.toObject() : product;
      return {
        ...plain,
        isMine: currentUserId === plain.ownerId,
        isWishlisted: wishlistedIds.has(plain._id.toString()),
        wishlistCount: wishlistCountMap[plain._id.toString()] || 0,
        images: plain.images || [],
      };
    });

    res.status(200).json({
      data: enriched,
      total: mergedResults.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("Error getting nearby products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getNearbyProducts,
};
