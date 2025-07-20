// controllers/admin/admins.js
const sdk = require("node-appwrite");

const getAllAdmins = async (req, res) => {
  try {
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    const DB_ID = process.env.APPWRITE_DATABASE_ID; 
    const USER_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID;

    // Fetch users with role "ADMIN"
    const response = await databases.listDocuments(DB_ID, USER_COLLECTION_ID, [
      sdk.Query.equal("role", "ADMIN"),
    ]);

    const adminMap = {};
    response.documents.forEach((doc) => {
      adminMap[doc.appwriteId] = doc.name || doc.email; // Fallback to email if no name
    });

    return res.status(200).json({ success: true, adminMap });
  } catch (error) {
    console.error("Error fetching admins:", error.message);
    return res.status(500).json({ error: "Failed to fetch admins" });
  }
};

module.exports = { getAllAdmins };
