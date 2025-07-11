// services/cleanup.js
const Product = require("../models/Product");
const { storage } = require("../config/appwrite");

async function cleanupUserProducts(userId) {
  try {
    const products = await Product.find({ ownerId: userId });
    const allImageIds = products.flatMap((product) => product.images);
    console.log(
      `🧹 Cleaning up ${products.length} products for user ${userId}`
    );
    console.log(
      `🗑️ Deleting ${allImageIds.length} images from Appwrite storage...`
    );
    await Promise.all(
      allImageIds.map((fileId) =>
        storage
          .deleteFile(process.env.APPWRITE_BUCKET_ID, fileId)
          .catch((err) => {
            console.warn(`Failed to delete image ${fileId}:`, err.message);
          })
      )
    );

    await Product.deleteMany({ ownerId: userId });
    console.log(`✅ Cleanup complete for user ${userId}`);
  } catch (err) {
    console.error("Error during cleanup:", err);
    throw err;
  }
}

module.exports = { cleanupUserProducts };
