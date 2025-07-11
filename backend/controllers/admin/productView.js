const { ProductView } = require("../../models/admin");

// ⏱️ Rate limit threshold (in milliseconds)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// 🧠 Log product view with rate-limiting logic
const logProductView = async (req, res) => {
  try {
    const { productId, viewerAppwriteId } = req.body;
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

    // Build query for rate-limiting based on either user ID or IP
    const query = {
      productId,
      viewedAt: { $gte: oneHourAgo },
    };

    if (viewerAppwriteId) {
      query.viewerAppwriteId = viewerAppwriteId;
    } else if (ip) {
      query.ip = ip;
    }

    const recentView = await ProductView.findOne(query);

    if (recentView) {
      return res.status(429).json({
        success: false,
        message: "View already logged recently. Rate limited.",
      });
    }

    const view = new ProductView({
      productId,
      viewerAppwriteId,
      ip,
      userAgent,
    });

    await view.save();

    res.status(201).json({
      success: true,
      message: "View logged successfully",
    });
  } catch (error) {
    console.error("Failed to log product view:", error.message);
    res.status(500).json({ error: "Failed to log product view" });
  }
};

// 📊 Get paginated views for a product
const getViewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const [views, total] = await Promise.all([
      ProductView.find({ productId })
        .sort({ viewedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductView.countDocuments({ productId }),
    ]);

    res.status(200).json({
      success: true,
      views,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching views:", error.message);
    res.status(500).json({ error: "Failed to fetch product views" });
  }
};

module.exports = {
  logProductView,
  getViewsByProduct,
};
