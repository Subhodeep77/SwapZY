const createProduct = require('./createProduct');
const deleteProduct = require('./deleteProduct');
const updateProduct = require('./updateProduct');
const bulkUpload = require('./bulkUpload');
const bulkDelete = require('./bulkDelete');
const getNearbyProduct = require('./getNearbyProducts');
const getAllProduct = require('./getAllProducts');
const getMyProduct = require('./getMyProducts');
const getProductById = require('./getProductById');
const markStatus = require('./markProductStatus');

module.exports = { createProduct, deleteProduct, updateProduct, bulkUpload, bulkDelete, getNearbyProduct, getAllProduct, getMyProduct, getProductById, markStatus };