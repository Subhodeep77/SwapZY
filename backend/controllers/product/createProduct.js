const sharp = require("sharp");
const { getUserServices } = require("../../config/appwrite");
const Product = require("../../models/Product");
const upload = require("../../utils/multerConfig");

const createProductWithImages = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      college,
      city,
      district,
      state,
      condition,
      lng,
      lat,
      status,
    } = req.body;

    const ownerId = req.user.appwriteId;
    const jwt = req.headers.authorization?.split(" ")[1];

    if (!jwt) {
      return res.status(401).json({ error: "Missing JWT token" });
    }

    const { storage, ID } = getUserServices(jwt);


    if (!title || !price || !college || !city || !lng || !lat) {
      return res.status(400).json({
        error: "Missing required fields: title, price, college, city, lng, lat",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      // Upload original (compressed slightly)
      const originalBuffer = await sharp(file.buffer)
        .resize(800) // optional resizing
        .jpeg({ quality: 80 })
        .toBuffer();

      const originalUpload = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        ID.unique(),
        Buffer.from(originalBuffer),
        file.mimetype,
        ["read:*"]
      );

      // Create and upload thumbnail (low-res)
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300) // thumbnail width
        .jpeg({ quality: 60 })
        .toBuffer();

      const thumbnailUpload = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        ID.unique(),
        Buffer.from(thumbnailBuffer),
        file.mimetype,
        ["read:*"]
      );

      uploadedImages.push({
        original: originalUpload.$id,
        thumbnail: thumbnailUpload.$id,
      });
    }

    const newProduct = new Product({
      title,
      description,
      price,
      category,
      images: uploadedImages,
      ownerId,
      college,
      city,
      district,
      state,
      condition: condition || "used",
      status: ["available", "sold", "expired"].includes(status) ? status : "available",
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
    });

    await newProduct.save();

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error) {
    console.error("Create product with images error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  upload: upload.array("images", 5), // max 5 images
  createProductWithImages,
};
