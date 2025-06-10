const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true },
    images: [
      {
        original: { type: String, required: true },
        thumbnail: { type: String, required: true },
      }
    ], // Appwrite file IDs
    ownerId: { type: String, required: true }, // Appwrite user ID
    // 📦 Product status: available, sold, expired
    status: {
      type: String,
      enum: ["available", "sold", "expired"],
      default: "available",
    },

    college: { type: String, required: true },
    condition: {
      type: String,
      enum: ["new", "like-new", "used"],
      default: "used",
    },

    // 📍 Location Metadata
    city: { type: String, required: true },
    district: { type: String },
    state: { type: String },
    country: { type: String, default: "India" },

    // 🌍 GeoJSON Location Point
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// 🔍 Enable geospatial index
productSchema.index({ location: "2dsphere" });

// 🚀 Useful indexes for filtering/sorting/searching
productSchema.index({ status: 1 });                // Filter available products
productSchema.index({ category: 1 });              // Category filters
productSchema.index({ price: 1 });                 // Sorting by price
productSchema.index({ createdAt: -1 });            // Sorting by latest
productSchema.index({ condition: 1 });             // Condition filters

// 🔍 Full-text-like search (regex-based)
productSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
