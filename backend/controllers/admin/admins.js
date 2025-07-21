// controllers/admin/admins.js
const sdk = require("node-appwrite");

// 🧠 In-memory cache (expires every 10 minutes)
let cachedAdminMap = null;
let lastFetchedTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const getAdminMap = async () => {
  const now = Date.now();

  if (cachedAdminMap && now - lastFetchedTime < CACHE_TTL_MS) {
    return cachedAdminMap;
  }

  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);
  const DB_ID = process.env.APPWRITE_DATABASE_ID;
  const USER_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID;

  const adminMap = {};
  let allAdmins = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await databases.listDocuments(DB_ID, USER_COLLECTION_ID, [
      sdk.Query.equal("role", "ADMIN"),
      sdk.Query.limit(limit),
      sdk.Query.offset(offset),
    ]);

    allAdmins = [...allAdmins, ...response.documents];
    if (response.documents.length < limit) break;
    offset += limit;
  }

  for (const doc of allAdmins) {
    const id = doc.appwriteId;
    if (id) {
      adminMap[id] = doc.name || doc.email || "Unknown Admin";
    }
  }

  cachedAdminMap = adminMap;
  lastFetchedTime = now;
  return adminMap;
};

// Express controller for GET /api/admins
const getAllAdmins = async (req, res) => {
  try {
    const adminMap = await getAdminMap();
    return res.status(200).json({ success: true, adminMap });
  } catch (error) {
    console.error("Error fetching admins:", error.message);
    return res.status(500).json({ error: "Failed to fetch admins" });
  }
};

module.exports = { getAllAdmins, getAdminMap };
