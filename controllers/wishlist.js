const Wishlist = require("../../models/Wishlist");
const Product = require("../../models/Product");

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

    // ❌ Prevent adding own product
    if (product.ownerId === userId) {
      return res.status(400).json({ error: "Cannot wishlist your own product." });
    }

    // ❌ Prevent sold/expired products
    if (["sold", "expired"].includes(product.status)) {
      return res.status(400).json({ error: "Cannot wishlist sold or expired products." });
    }

    // ✅ Save if not already exists (unique index handles duplicate prevention)
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

  try {
    const wishlistItems = await Wishlist.find({ userId }).populate("productId");

    const filtered = wishlistItems
      .filter(item => item.productId) // Filter out if product is deleted
      .map(item => item.productId);  // Return only product info

    res.status(200).json({ wishlist: filtered });
  } catch (err) {
    console.error("Fetch wishlist error:", err.message);
    res.status(500).json({ error: "Failed to fetch wishlist." });
  }
};


module.exports = { addToWishlist, removeFromWishlist, getMyWishlist };
