// utils/getPreviewUrl.js
const sdk = require("node-appwrite");
const { storage } = require("../config/appwrite");

const getAvatarPreviewUrl = (fileId) => {
  if (!fileId) return null;

  // This creates a signed preview URL (not public unless bucket has permissions)
  return storage.getFilePreview(process.env.APPWRITE_BUCKET_ID, fileId).href;
};

module.exports = { getAvatarPreviewUrl };
