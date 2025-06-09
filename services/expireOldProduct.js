const cron = require("node-cron");
const Product = require("../models/Product");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

    const result = await Product.updateMany(
      {
        status: "available",
        createdAt: { $lt: fortyFiveDaysAgo },
      },
      { $set: { status: "expired" } }
    );

    console.log(`✅ Auto-expired ${result.modifiedCount} products`);
  } catch (error) {
    console.error("❌ Failed to auto-expire products:", error.message);
  }
});
