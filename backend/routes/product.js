const express = require("express");
const router = express.Router();
const verifyAppwriteToken = require("../middlewares/verifyAppwriteToken");
const parseLocation = require("../middlewares/parseLocation");
const { createProduct, deleteProduct, updateProduct, bulkUpload, bulkDelete, getNearbyProduct, getAllProduct, getMyProduct, getProductById, markStatus } = require("../controllers/product");
const multer = require('multer');
const path = require('path');
const optionalAppwriteToken = require("../middlewares/optionalAppwriteToken");
const { createProductLimiter, deleteProductLimiter, updateProductLimiter, bulkUploadLimiter, bulkDeleteLimiter, markStatusLimiter } = require("../middlewares/rateLimiter");
const uploadCSV = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed!"), false);
    }
  },
});


// Unified product + image upload
router.post(
  "/create",
  verifyAppwriteToken,
  createProductLimiter,
  createProduct.upload,
  createProduct.createProductWithImages
);

router.delete(
  "/:id",
  verifyAppwriteToken,
  deleteProductLimiter,
  deleteProduct.deleteProductWithImages
);

router.put(
  "/:id",
  verifyAppwriteToken,
  updateProductLimiter,
  updateProduct.upload, // for new uploads
  updateProduct.updateProductWithImages
);


router.post(
  '/bulk-upload',
  verifyAppwriteToken, // only authenticated users can upload
  bulkUploadLimiter,
  uploadCSV.single('file'), // expecting a single file field named 'file'
  bulkUpload.bulkUploadProducts
);


router.delete(
    "/bulk", 
    verifyAppwriteToken,
    bulkDeleteLimiter, 
    bulkDelete.bulkDeleteProducts
);

router.get(
  '/nearby',
  verifyAppwriteToken,
  parseLocation,
  getNearbyProduct.getNearbyProducts
);

router.get(
  "/all",
  optionalAppwriteToken,
  getAllProduct.getAllProducts
);

router.get(
  "/mine",
  verifyAppwriteToken,
  getMyProduct.getMyProducts  
);

router.get(
  "/:id",
  optionalAppwriteToken,
  getProductById.getProductById
);

router.patch(
  "/:id/status",
  markStatusLimiter,
  verifyAppwriteToken, 
  markStatus.markProductStatus
);

console.log("Loaded product routes");
module.exports = router;
