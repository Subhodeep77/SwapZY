const cron = require("node-cron");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const cleanupWishlist = async () => {
  try {
    const expiredOrSoldProducts = await Product.find({
      status: { $in: ["sold", "expired"] },
    }).select("_id");

    const expiredProductIds = expiredOrSoldProducts.map(p => p._id);

    const result = await Wishlist.deleteMany({ productId: { $in: expiredProductIds } });

    console.log(`[Wishlist Cleanup] Removed ${result.deletedCount} entries.`);
  } catch (err) {
    console.error("Wishlist cleanup error:", err.message);
  }
};

// Run daily at 2:00 AM
cron.schedule("0 2 * * *", () => {
  console.log("🔁 Running wishlist cleanup job...");
  cleanupWishlist();
});
