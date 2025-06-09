const Product = require("../../models/Product");

const getNearbyProducts = async (req, res) => {
  try {
    const { lng, lat, college, city, district, state } = req.query;
    const currentUserId = req.user.appwriteId;

    if (!lng || !lat || !college || !city || !state) {
      return res.status(400).json({ error: "Missing required location fields." });
    }

    const userLocation = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    const searchLevels = [
      { filter: { college }, maxDistance: 5000 },
      { filter: { city }, maxDistance: 15000 },
      district ? { filter: { district }, maxDistance: 25000 } : null,
      { filter: { state }, maxDistance: 50000 },
      { filter: {}, maxDistance: 100000 },
    ].filter(Boolean);

    let products = [];

    for (let level of searchLevels) {
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
        { $limit: 30 },
      ]);

      if (result.length) {
        products = result;
        break;
      }
    }

    const enriched = products.map((product) => ({
      ...product,
      isMine: product.ownerId === currentUserId,
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Error getting nearby products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getNearbyProducts,
};
