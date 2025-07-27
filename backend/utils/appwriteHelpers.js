const { getUserServices } = require("../config/appwrite");

const getAdminId = async (jwt) => {
  const { databases, Query } = getUserServices(jwt);

  const result = await databases.listDocuments(
    process.env.APPWRITE_DB_ID,
    process.env.APPWRITE_USERS_COLLECTION_ID,
    [Query.equal("role", "ADMIN")]
  );

  if (result.documents.length === 0) {
    throw new Error("No admin found in Appwrite users collection");
  }

  return result.documents[0].appwriteId;
};

module.exports = { getAdminId };
