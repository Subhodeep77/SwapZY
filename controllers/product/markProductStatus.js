const Product = require("../../models/Product");

// Constants for expiration
const EXPIRATION_DAYS = 45;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const markProductStatus = async (req, res) => {
  const productId = req.params.id;
  const ownerId = req.user.appwriteId;
  const { status } = req.body;

  const validStatuses = ["sold", "expired"];

  try {
    // Allow only sold or expired to be marked manually
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Only 'sold' or 'expired' are allowed.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.ownerId !== ownerId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Prevent changing status if already marked sold/expired
    if (product.status === "sold" || product.status === "expired") {
      return res.status(400).json({
        error: `Cannot change status once it's marked as '${product.status}'`,
      });
    }

    // Auto-expire if product is older than 45 days and still available
    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const daysSinceCreation = (now - createdAt) / MS_PER_DAY;

    if (daysSinceCreation > EXPIRATION_DAYS && product.status === "available") {
      product.status = "expired";
      await product.save();
      return res.status(200).json({
        message: "Product was older than 45 days and has been auto-marked as 'expired'.",
        product,
      });
    }

    // Manual mark to sold or expired
    product.status = status;
    await product.save();

    res.status(200).json({
      message: `Product marked as '${status}'`,
      product,
    });
  } catch (err) {
    console.error("Mark status error:", err.message);
    res.status(500).json({ error: "Failed to mark product status" });
  }
};

module.exports = { markProductStatus };
