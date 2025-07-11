const cron = require("node-cron");
const { Product } = require("../models/Product");

const expireOldProducts = async (io) => {
  try {
    const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

    const expiredProducts = await Product.find({
      status: "available",
      createdAt: { $lt: fortyFiveDaysAgo },
    });

    for (const product of expiredProducts) {
      product.status = "expired";
      await product.save();

      // ✅ Emit socket event to seller
      if (io) {
        io.to(product.ownerId).emit("product:expired", {
          productId: product._id,
          message: "Your product has expired due to inactivity.",
        });
      }
    }

    console.log(`✅ Auto-expired ${expiredProducts.length} products`);
  } catch (error) {
    console.error("❌ Failed to auto-expire products:", error.message);
  }
};

// ⏰ Schedule the task (you'll need to pass `io` explicitly from somewhere)
const scheduleProductExpiry = (io) => {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running auto-expire products task...");
    await expireOldProducts(io);
  });
};

module.exports = scheduleProductExpiry;
