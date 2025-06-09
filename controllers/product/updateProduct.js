const Product = require("../../models/Product");
const { storage, ID } = require("../../config/appwrite");
const sharp = require("sharp");
const upload = require("../../utils/multerConfig");

const updateProductWithImages = async (req, res) => {
  const productId = req.params.id;
  const ownerId = req.user.appwriteId;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.ownerId !== ownerId)
      return res.status(403).json({ error: "Not authorized" });

    // ✅ Step 1: Validate image IDs to delete
    const imagesToDelete = req.body.imagesToDelete || []; // These should be original image IDs
    const validImageIds = product.images.map((img) => img.original.toString());
    const invalidDeletions = imagesToDelete.filter(
      (id) => !validImageIds.includes(id)
    );

    if (invalidDeletions.length > 0) {
      return res.status(400).json({
        error: "One or more invalid image IDs to delete",
        invalidImageIds: invalidDeletions,
      });
    }

    // ✅ Step 2: Remove images from product and Appwrite
    const retainedImages = product.images.filter(
      (img) => !imagesToDelete.includes(img.original)
    );

    const deletedImagePairs = product.images.filter((img) =>
      imagesToDelete.includes(img.original)
    );

    const deletePromises = [];
    for (const img of deletedImagePairs) {
      deletePromises.push(
        storage.deleteFile(process.env.APPWRITE_BUCKET_ID, img.original)
      );
      deletePromises.push(
        storage.deleteFile(process.env.APPWRITE_BUCKET_ID, img.thumbnail)
      );
    }
    await Promise.all(deletePromises);

    product.images = retainedImages;

    // ✅ Step 3: Image limit check
    const incomingFiles = req.files || [];
    if (product.images.length + incomingFiles.length > 5) {
      return res.status(400).json({
        error: "Cannot exceed 5 images per product",
      });
    }

    // ✅ Step 4: Upload + compress new images
    const newImages = [];
    for (const file of incomingFiles) {
      const originalBuffer = await sharp(file.buffer)
        .resize(800)
        .jpeg({ quality: 80 })
        .toBuffer();

      const originalUpload = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        ID.unique(),
        Buffer.from(originalBuffer),
        file.mimetype,
        ["read:*"]
      );

      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300)
        .jpeg({ quality: 60 })
        .toBuffer();

      const thumbnailUpload = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        ID.unique(),
        Buffer.from(thumbnailBuffer),
        file.mimetype,
        ["read:*"]
      );

      newImages.push({
        original: originalUpload.$id,
        thumbnail: thumbnailUpload.$id,
      });
    }

    product.images.push(...newImages);

    // ✅ Step 5: Update product fields
    const {
      title,
      description,
      price,
      category,
      condition,
      status,
      college,
      city,
      district,
      state,
      country,
      latitude,
      longitude,
    } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;

    const validConditions = ["new", "like-new", "used"];
    if (condition) {
      if (!validConditions.includes(condition)) {
        return res.status(400).json({ error: "Invalid condition value." });
      }
      product.condition = condition;
    }

    const validStatuses = ["available", "sold", "expired"];
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
      }

      if (["sold", "expired"].includes(product.status)) {
        return res.status(400).json({
          error:
            "Cannot update status after product is sold or expired. Use dedicated status endpoint.",
        });
      }

      product.status = status;
    }

    if (college) product.college = college;
    if (city) product.city = city;
    if (district) product.district = district;
    if (state) product.state = state;
    if (country) product.country = country;

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid latitude/longitude" });
      }
      product.location = {
        type: "Point",
        coordinates: [lon, lat],
      };
    }

    await product.save();

    res.status(200).json({ message: "Product updated", product });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ error: "Product update failed" });
  }
};

module.exports = {
  upload: upload.array("images", 5),
  updateProductWithImages,
};
