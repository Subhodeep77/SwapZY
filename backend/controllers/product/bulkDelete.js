const mongoose = require("mongoose");
const Product = require("../../models/Product");
const { getUserServices } = require("../../config/appwrite");

async function bulkDeleteProducts(req, res) {
  try {
    const { productIds } = req.body;
    const userId = req.user.appwriteId;
    const jwt = req.headers.authorization?.split(" ")[1];

    if (!jwt) {
      return res.status(401).json({ error: "JWT token missing." });
    }

    const { storage } = getUserServices(jwt);

    // 1️⃣ Validate input
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: "No product IDs provided." });
    }

    // 2️⃣ Filter only valid ObjectIds
    const validObjectIds = productIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validObjectIds.length === 0) {
      return res.status(400).json({ error: "No valid product IDs provided." });
    }

    // 3️⃣ Fetch user's products only
    const userProducts = await Product.find({
      _id: { $in: validObjectIds },
      ownerId: userId,
    });

    const userProductIds = userProducts.map((p) => p._id.toString());

    // 4️⃣ Delete associated images in parallel (gracefully handles individual errors)
    const allImageIds = userProducts.flatMap((p) =>
      p.images.flatMap((img) => [img.original, img.thumbnail])
    );

    const imageDeletionResults = await Promise.allSettled(
      allImageIds.map((id) =>
        storage.deleteFile(process.env.APPWRITE_BUCKET_ID, id)
      )
    );

    const failedImages = imageDeletionResults
      .map((res, idx) => ({
        id: allImageIds[idx],
        status: res.status,
        reason: res.reason,
      }))
      .filter((r) => r.status === "rejected");

    if (failedImages.length > 0) {
      console.warn("Some image deletions failed:", failedImages);
    }

    // 5️⃣ Delete user-owned products from DB
    await Product.deleteMany({ _id: { $in: userProductIds } });

    // 6️⃣ Return skipped (invalid or unauthorized) product IDs
    const userProductIdSet = new Set(userProductIds);
    const skipped = productIds.filter((id) => !userProductIdSet.has(id));

    return res.status(200).json({
      message: "Bulk deletion completed.",
      deletedCount: userProductIds.length,
      skipped,
      failedImageIds: failedImages.map((f) => f.id), // Optional
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    return res.status(500).json({ error: "Bulk deletion failed." });
  }
}

module.exports = { bulkDeleteProducts };
