const Product = require("../../models/Product");

const getNearbyProducts = async (req, res) => {
  try {
    const { lng, lat, college, city, district, state } = req.query;
    const currentUserId = req.user?.appwriteId;

    // 1. Validate required location fields
    if (!lng || !lat || !college || !city || !state) {
      return res.status(400).json({ error: "Missing required location fields." });
    }

    // 2. Parse and validate coordinates
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).json({ error: "Invalid coordinates." });
    }

    const userLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    // 3. Define expanding search levels (college → state → general nearby)
    const searchLevels = [
      { filter: { college }, maxDistance: 5 * 1000 },       // 🎓 Same college (~5 km)
      { filter: { city }, maxDistance: 15 * 1000 },         // 🏙️ Same city (~15 km)
      district ? { filter: { district }, maxDistance: 25 * 1000 } : null, // 🏞️ Same district
      { filter: { state }, maxDistance: 50 * 1000 },        // 🗺️ Same state (~50 km)
      { filter: {}, maxDistance: 100 * 1000 },              // 🌐 Fallback nearby (~100 km)
    ].filter(Boolean);

    let products = [];

    // 4. Attempt to find results in increasingly larger radius/area
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

    // 5. Enrich with isMine and clean image URLs
    const enriched = products.map((product) => ({
      ...product,
      isMine: currentUserId === product.ownerId,
      images: product.images || [], // ensure images are present
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
