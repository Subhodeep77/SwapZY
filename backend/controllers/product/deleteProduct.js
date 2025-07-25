const Product = require("../../models/Product");
const { getUserServices } = require("../../config/appwrite");

const deleteProductWithImages = async (req, res) => {
  const productId = req.params.id;
  const ownerId = req.user.appwriteId;
  const jwt = req.headers.authorization?.split(" ")[1];

  if (!jwt) {
    return res.status(401).json({ error: "Missing JWT token" });
  }

  try {
    const { storage } = getUserServices(jwt);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.ownerId !== ownerId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this product" });
    }

    // Delete all associated images
    const deletePromises = [];
    for (const img of product.images) {
      deletePromises.push(
        storage.deleteFile(process.env.APPWRITE_BUCKET_ID, img.original)
      );
      deletePromises.push(
        storage.deleteFile(process.env.APPWRITE_BUCKET_ID, img.thumbnail)
      );
    }

    const results = await Promise.allSettled(deletePromises);

    const failedDeletions = results
      .map((r, idx) => ({
        status: r.status,
        fileId:
          idx % 2 === 0
            ? product.images[Math.floor(idx / 2)].original
            : product.images[Math.floor(idx / 2)].thumbnail,
        reason: r.reason,
      }))
      .filter((r) => r.status === "rejected");

    await Product.findByIdAndDelete(productId);

    // Log deletion
    console.log(`[DELETED PRODUCT]`, {
      title: product.title,
      productId: product._id,
      deletedBy: req.user.email || ownerId,
      timestamp: new Date().toISOString(),
    });

    // TODO :- Trigger Appwrite Function

    res.status(200).json({
      message: "Product and associated images deleted successfully",
      failedImages: failedDeletions.map((d) => d.fileId),
    });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ error: "Product deletion failed" });
  }
};

module.exports = {
  deleteProductWithImages,
};
