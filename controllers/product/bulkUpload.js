const fs = require("fs/promises");
const path = require("path");
const csvParser = require("csv-parser");
const { createReadStream } = require("fs");
const Product = require("../../models/Product");

function validateRow(row) {
  const errors = [];

  if (!row.title || row.title.trim() === "") errors.push("Missing title");
  if (!row.description || row.description.trim() === "") errors.push("Missing description");
  if (!row.price || isNaN(Number(row.price))) errors.push("Invalid or missing price");
  if (row.price < 0 || row.price > 100000) errors.push("Price out of acceptable range");
  if (!row.category || row.category.trim() === "") errors.push("Missing category");
  if (!row.college || row.college.trim() === "") errors.push("Missing college");
  if (!row.condition || !["new", "like-new", "used"].includes(row.condition)) errors.push("Invalid condition");
  if (!row.city || row.city.trim() === "") errors.push("Missing city");
  if (!row.latitude || !row.longitude || isNaN(Number(row.latitude)) || isNaN(Number(row.longitude))) {
    errors.push("Missing or invalid coordinates");
  }
  if (row.status && !["available", "sold", "expired"].includes(row.status)) {
    errors.push("Invalid status");
  }

  return errors;
}

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const validProducts = [];
    const invalidRows = [];

    createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const errors = validateRow(row);

        if (errors.length === 0) {
          validProducts.push({
            title: row.title.trim(),
            description: row.description.trim(),
            price: parseFloat(row.price),
            category: row.category.trim(),
            images: [
              {
                original: "", // can be updated later if needed
                thumbnail: ""
              }
            ],
            ownerId: row.ownerId?.trim() || "", // will be overwritten by logged-in user
            college: row.college.trim(),
            condition: row.condition.trim(),
            city: row.city.trim(),
            district: row.district?.trim() || "",
            state: row.state?.trim() || "",
            country: row.country?.trim() || "India",
            status: row.status?.trim() || "available",
            location: {
              type: "Point",
              coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
            },
          });
        } else {
          invalidRows.push({ row, errors });
        }
      })
      .on("end", () => resolve({ validProducts, invalidRows }))
      .on("error", reject);
  });
}

async function bulkUploadProducts(req, res) {
  const filePath = req.file.path;

  try {
    const { validProducts, invalidRows } = await parseCSV(filePath);

    let insertedProducts = [];

    if (validProducts.length > 0) {
      // 🔐 Inject logged-in user as owner
      validProducts.forEach((product) => {
        product.ownerId = req.user.appwriteId;
      });

      // 🔍 Pre-check for duplicates
      const titles = validProducts.map(p => p.title);
      const existing = await Product.find({
        title: { $in: titles },
        ownerId: req.user.appwriteId
      }).lean();

      const existingTitleSet = new Set(existing.map(e => e.title));

      // ❌ Remove duplicates from validProducts and push them to invalidRows
      const uniqueProducts = [];
      for (const product of validProducts) {
        if (!existingTitleSet.has(product.title)) {
          uniqueProducts.push(product);
        } else {
          invalidRows.push({
            row: product,
            errors: ["Duplicate title for this user"]
          });
        }
      }

      // 💾 Save the remaining products
      if (uniqueProducts.length > 0) {
        insertedProducts = await Product.insertMany(uniqueProducts, { ordered: false });
      }
    }

    await fs.unlink(filePath); // Cleanup

    return res.status(200).json({
      message: "Bulk upload complete",
      inserted: insertedProducts.length,
      rejected: invalidRows.length,
      productIds: insertedProducts.map((p) => p._id),
      invalidRows,
    });
  } catch (error) {
    console.error("Bulk upload failed:", error);
    try {
      await fs.unlink(filePath); // Cleanup on error
    } catch (_) {}

    return res.status(500).json({ error: "Bulk upload failed" });
  }
}

module.exports = {
  bulkUploadProducts,
};
