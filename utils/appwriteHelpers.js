// src/utils/appwriteHelpers.js
const sdk = require("node-appwrite");

const getAdminId = async () => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  const result = await databases.listDocuments(
    process.env.APPWRITE_DB_ID,
    process.env.APPWRITE_USERS_COLLECTION_ID,
    [sdk.Query.equal("role", "ADMIN")]
  );

  if (result.documents.length === 0) {
    throw new Error("No admin found in Appwrite users collection");
  }

  return result.documents[0].appwriteId;
};

module.exports = { getAdminId };
