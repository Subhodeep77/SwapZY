const Product = require("../../models/Product");
const Wishlist = require("../../models/Wishlist");

const getNearbyProducts = async (req, res) => {
  try {
    const { lng, lat, college, city, district, state } = req.query;
    const currentUserId = req.user?.appwriteId;

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

    const searchLevels = [
      { filter: { college }, maxDistance: 5 * 1000 },
      { filter: { city }, maxDistance: 15 * 1000 },
      district ? { filter: { district }, maxDistance: 25 * 1000 } : null,
      { filter: { state }, maxDistance: 50 * 1000 },
      { filter: {}, maxDistance: 100 * 1000 },
    ].filter(Boolean);

    let products = [];

    for (const level of searchLevels) {
      const result = await Product.aggregate([
        {
          $geoNear: {
            near: userLocation,
            distanceField: "distance",
            maxDistance: level.maxDistance,
            spherical: true,
            query: {
              status: "available",
              ...level.filter,
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 30 },
      ]);

      if (result.length > 0) {
        products = result;
        break;
      }
    }

    const productIds = products.map((p) => p._id);

    // Get wishlist entries for these products
    const wishlistEntries = await Wishlist.find({
      productId: { $in: productIds },
    }).select("productId userId");

    // Prepare map for count and user-specific wishlist detection
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
      isMine: currentUserId === product.ownerId,
      isWishlisted: wishlistedIds.has(product._id.toString()),
      wishlistCount: wishlistCountMap[product._id.toString()] || 0,
      images: product.images || [],
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error("Error getting nearby products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getNearbyProducts,
};
