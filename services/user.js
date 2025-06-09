const { databases, ID, Query } = require("../config/appwrite");
const { getAvatarPreviewUrl } = require("../utils/getPreviewUrl");

const createUser = async ({ appwriteId, name, email, avatar = "", bio = "", college = "", contact = "" }) => {
  const timestamp = new Date().toISOString();
  const data = {
    appwriteId,
    name,
    email,
    avatar,
    bio,
    college,
    contact,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const doc = await databases.createDocument(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_USERS_COLLECTION_ID,
    ID.unique(),
    data
  );

  return { ...doc, id: doc.$id };
};

const getUserByAppwriteId = async (appwriteId) => {
  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("appwriteId", appwriteId)]
    );

    const user = response.documents[0];
    if (!user) return null;

    // Replace avatar ID with preview URL
    user.avatarUrl = getAvatarPreviewUrl(user.avatar);
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user from Appwrite DB: " + error.message);
  }
};

module.exports = {
  createUser,
  getUserByAppwriteId,
};
