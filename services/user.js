const { databases, ID, Query, users: appwriteUsers } = require("../config/appwrite");
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

    if (user.isDeleted) {
      throw new Error("This user has been banned by an admin.");
    }

    user.avatarUrl = getAvatarPreviewUrl(user.avatar);
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user from Appwrite DB: " + error.message);
  }
};

const getAllUsersFromDatabase = async ({
  limit = 100,
  offset = 0,
  role,
  isDeleted = false,
  college,
  search,
} = {}) => {
  try {
    const filters = [Query.equal("isDeleted", isDeleted)];

    if (role) filters.push(Query.equal("role", role));
    if (college) filters.push(Query.equal("college", college));
    if (search) {
      filters.push(
        Query.or([
          Query.search("name", search),
          Query.search("email", search),
        ])
      );
    }

    // Fetch paginated data
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [
        ...filters,
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("createdAt"),
      ]
    );

    // Fetch total count (without pagination)
    const totalResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      filters
    );

    const users = response.documents.map(user => ({
      ...user,
      avatarUrl: getAvatarPreviewUrl(user.avatar),
    }));

    const totalCount = totalResponse.total || totalResponse.documents.length;

    return { users, totalCount };
  } catch (error) {
    throw new Error("Failed to fetch users from Appwrite DB: " + error.message);
  }
};

const updateUser = async (appwriteId, updates = {}) => {
  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("appwriteId", appwriteId)]
    );

    const user = response.documents[0];
    if (!user) throw new Error("User not found");
    if (user.isDeleted) throw new Error("Cannot update banned user.");

    if (updates.role && !["USER", "ADMIN"].includes(updates.role)) {
      throw new Error("Invalid role. Allowed roles are 'USER' and 'ADMIN'.");
    }

    const updatedFields = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updated = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      user.$id,
      updatedFields
    );

    return updated;
  } catch (error) {
    throw new Error("Failed to update user: " + error.message);
  }
};

const deleteUser = async (appwriteId) => {
  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("appwriteId", appwriteId)]
    );

    const user = response.documents[0];
    if (!user) throw new Error("User not found");

    // Delete user from Auth system
    await appwriteUsers.delete(user.appwriteId);

    // Delete from custom DB
    await databases.deleteDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      user.$id
    );

    return true;
  } catch (error) {
    throw new Error("Failed to delete user: " + error.message);
  }
};

const softDeleteUser = async (appwriteId) => {
  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("appwriteId", appwriteId)]
    );

    const user = response.documents[0];
    if (!user) throw new Error("User not found");
    if (user.isDeleted) throw new Error("User is already banned.");

    const updated = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      user.$id,
      {
        isDeleted: true,
        updatedAt: new Date().toISOString(),
      }
    );

    return updated;
  } catch (error) {
    throw new Error("Failed to soft delete user: " + error.message);
  }
};

module.exports = {
  createUser,
  getUserByAppwriteId,
  getAllUsersFromDatabase,
  updateUser,
  deleteUser,
  softDeleteUser,
};
