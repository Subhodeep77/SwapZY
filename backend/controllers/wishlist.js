const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const addToWishlist = async (req, res) => {
  const userId = req.user.appwriteId;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (product.ownerId === userId) {
      return res.status(400).json({ error: "Cannot wishlist your own product." });
    }

    if (["sold", "expired"].includes(product.status)) {
      return res.status(400).json({ error: "Cannot wishlist sold or expired products." });
    }

    const wishlistEntry = new Wishlist({ userId, productId });
    await wishlistEntry.save();

    res.status(201).json({ message: "Product added to wishlist." });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Product is already in wishlist." });
    }
    console.error("Add to wishlist error:", err.message);
    res.status(500).json({ error: "Failed to add to wishlist." });
  }
};

const removeFromWishlist = async (req, res) => {
  const userId = req.user.appwriteId;
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required." });
  }

  try {
    const result = await Wishlist.findOneAndDelete({ userId, productId });

    if (!result) {
      return res.status(404).json({ error: "Product not found in wishlist." });
    }

    res.status(200).json({ message: "Product removed from wishlist." });
  } catch (err) {
    console.error("Remove from wishlist error:", err.message);
    res.status(500).json({ error: "Failed to remove product from wishlist." });
  }
};

const getMyWishlist = async (req, res) => {
  const userId = req.user.appwriteId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const {
    category,
    city,
    district,
    state,
    condition,
    search,
    // ✅ Added Sorting Options
    sortBy = "createdAt",
    sortOrder = "desc",
    // ✅ Added Location Toggles
    onlyMyCollege,
    onlyMyCity,
  } = req.query;

  try {
    // ✅ Get user's college/city to filter against
    const userProducts = await Product.findOne({ ownerId: userId }, "college city");

    let productFilter = {
      status: { $nin: ["sold", "expired"] },
    };

    if (category) productFilter.category = category;
    if (city) productFilter.city = city;
    if (district) productFilter.district = district;
    if (state) productFilter.state = state;
    if (condition) productFilter.condition = condition;
    if (search) productFilter.title = { $regex: search, $options: "i" };

    // ✅ Apply user's college and city filters if requested
    if (onlyMyCollege === "true" && userProducts?.college)
      productFilter.college = userProducts.college;
    if (onlyMyCity === "true" && userProducts?.city)
      productFilter.city = userProducts.city;

    const wishlistItems = await Wishlist.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "productId",
        match: productFilter,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const validItems = wishlistItems.filter(item => item.productId);
    const invalidItems = wishlistItems.filter(item => !item.productId);
    const invalidProductIds = invalidItems.map(item => item.productId?._id || item.productId);

    if (invalidProductIds.length > 0) {
      await Wishlist.deleteMany({ userId, productId: { $in: invalidProductIds } });
    }

    const wishlistCountsMap = {};
    await Promise.all(
      validItems.map(async (item) => {
        const count = await Wishlist.countDocuments({ productId: item.productId._id });
        wishlistCountsMap[item.productId._id.toString()] = count;
      })
    );

    let productsWithCount = validItems.map(item => ({
      ...item.productId,
      wishlistCount: wishlistCountsMap[item.productId._id.toString()] || 0,
    }));

    // ✅ Sort wishlist products by requested field
    productsWithCount.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "price") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (sortBy === "condition" || sortBy === "title") {
        return sortOrder === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }

      if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }

      return 0;
    });

    const totalItems = await Wishlist.countDocuments({ userId });

    res.status(200).json({
      wishlist: productsWithCount,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    });
  } catch (err) {
    console.error("Fetch wishlist error:", err.message);
    res.status(500).json({ error: "Failed to fetch wishlist." });
  }
};


module.exports = {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
};
