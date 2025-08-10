// controllers/admin/admins.js
const { getAdminServices } = require("../../config/appwrite"); // Use Admin SDK for enrichment
const User = require("../../models/User");

let cachedAdminMap = null;
let lastFetchedTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Refresh the admin map from MongoDB
const refreshAdminCache = async () => {
  const admins = await User.find({ role: "ADMIN", isDeleted: false })
    .select("appwriteId name email")
    .lean();

  const adminMap = {};
  for (const admin of admins) {
    if (admin.appwriteId) {
      adminMap[admin.appwriteId] = {
        name: admin.name || admin.email || "Unknown Admin",
        email: admin.email || null
      };
    }
  }

  cachedAdminMap = adminMap;
  lastFetchedTime = Date.now();
  console.log("♻️ Admin cache refreshed manually");
  return adminMap;
};

const getAdminMap = async () => {
  const now = Date.now();
  if (cachedAdminMap && now - lastFetchedTime < CACHE_TTL_MS) {
    return cachedAdminMap;
  }
  return await refreshAdminCache();
};

// GET /admins — MongoDB for roles, Appwrite for live profile enrichment
const getAllAdmins = async (req, res) => {
  try {
    const adminMap = await getAdminMap();
    const { users } = getAdminServices(); // Admin SDK with API key

    const detailedAdmins = [];

    for (const [appwriteId, mongoData] of Object.entries(adminMap)) {
      try {
        const appwriteUser = await users.get(appwriteId);
        detailedAdmins.push({
          appwriteId,
          name: appwriteUser.name || mongoData.name,
          email: appwriteUser.email || mongoData.email,
          status: appwriteUser.status,
          emailVerification: appwriteUser.emailVerification,
          createdAt: appwriteUser.$createdAt
        });
      } catch (err) {
        // If Appwrite user not found or error, fallback to MongoDB data
        detailedAdmins.push({
          appwriteId,
          name: mongoData.name,
          email: mongoData.email,
          status: null,
          emailVerification: null,
          createdAt: null
        });
      }
    }

    return res.status(200).json({ success: true, admins: detailedAdmins });
  } catch (error) {
    console.error("Error fetching admins:", error.message);
    return res.status(500).json({ error: "Failed to fetch admins" });
  }
};

module.exports = { getAllAdmins, getAdminMap, refreshAdminCache };
