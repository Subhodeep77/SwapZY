const sdk = require("node-appwrite");
const { getAvatarPreviewUrl } = require("../utils/getPreviewUrl");
const { getUserServices } = require("../config/appwrite");

const createUser = async (
  jwt,
  { appwriteId, name, email, avatar = "", bio = "", college = "", contact = "" }
) => {
  const { databases, ID, Permission, Role } = getUserServices(jwt);

  const timestamp = new Date().toISOString();
  const data = {
    appwriteId,
    name,
    email,
    avatar,
    bio,
    college,
    contact,
    isDeleted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const permissions = [
    Permission.read(Role.user(appwriteId)),
    Permission.update(Role.user(appwriteId)),
    Permission.delete(Role.user(appwriteId)),
  ];

  const doc = await databases.createDocument(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_USERS_COLLECTION_ID,
    ID.unique(),
    data,
    permissions
  );

  return { ...doc, id: doc.$id };
};

const getUserByAppwriteId = async (jwt, appwriteId) => {
  const { databases, Query } = getUserServices(jwt);
  console.log("📁 DB ID:", process.env.APPWRITE_DATABASE_ID);
  console.log("📂 USERS COLLECTION ID:", process.env.APPWRITE_USERS_COLLECTION_ID);

  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("appwriteId", appwriteId)]
    );

    const user = response.documents[0];
    if (!user) return null;

    if (user?.isDeleted === true) {
      throw new Error("This user has been banned by an admin.");
    }

    user.avatarUrl = user.avatar ? getAvatarPreviewUrl(user.avatar) : null;
    return user;
  } catch (error) {
    console.error("❌ Appwrite fetch failed:", error); // helpful debug
    throw new Error("Failed to fetch user from Appwrite DB: " + error.message);
  }
};

const getAllUsersFromDatabase = async (
  jwt,
  { limit = 100, offset = 0, role, isDeleted = false, college, search } = {}
) => {
  const { databases, Query } = getUserServices(jwt);

  try {
    const filters = [Query.equal("isDeleted", isDeleted)];

    if (role) filters.push(Query.equal("role", role));
    if (college) filters.push(Query.equal("college", college));
    if (search) {
      filters.push(
        Query.or([Query.search("name", search), Query.search("email", search)])
      );
    }

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

    const totalResponse = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      filters
    );

    const users = response.documents.map((user) => ({
      ...user,
      avatarUrl: user.avatar ? getAvatarPreviewUrl(user.avatar) : null,
    }));

    const totalCount = totalResponse.total || totalResponse.documents.length;

    return { users, totalCount };
  } catch (error) {
    throw new Error("Failed to fetch users from Appwrite DB: " + error.message);
  }
};

const updateUser = async (jwt, appwriteId, updates = {}) => {
  const { databases, Query } = getUserServices(jwt);

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

const deleteUser = async (jwt, appwriteId) => {
  const { databases, Query, users: appwriteUsers } = getUserServices(jwt);

  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("appwriteId", appwriteId)]
    );

    const user = response.documents[0];
    if (!user) throw new Error("User not found");

    await appwriteUsers.delete(user.appwriteId);

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

const softDeleteUser = async (jwt, appwriteId) => {
  const { databases, Query } = getUserServices(jwt);

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

const restoreUser = async (jwt, appwriteId) => {
  const { databases, Query } = getUserServices(jwt);

  const response = await databases.listDocuments(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_USERS_COLLECTION_ID,
    [Query.equal("appwriteId", appwriteId)]
  );

  const user = response.documents[0];
  if (!user) throw new Error("User not found");
  if (!user.isDeleted) throw new Error("User is not banned.");

  console.log("DB ID:", process.env.APPWRITE_DATABASE_ID);
  console.log("COLLECTION ID:", process.env.APPWRITE_USERS_COLLECTION_ID);

  return await databases.updateDocument(
    process.env.APPWRITE_DATABASE_ID,
    process.env.APPWRITE_USERS_COLLECTION_ID,
    user.$id,
    {
      isDeleted: false,
      updatedAt: new Date().toISOString(),
    }
  );
};

module.exports = {
  createUser,
  getUserByAppwriteId,
  getAllUsersFromDatabase,
  updateUser,
  deleteUser,
  softDeleteUser,
  restoreUser,
};
