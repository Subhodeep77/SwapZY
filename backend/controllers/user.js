const { cleanupUserProducts } = require("../utils/cleanup");
const { getUserUsers, getUserStorage, ID} = require("../config/appwrite");
const sharp = require("sharp");
const {
  createUser,
  getUserByAppwriteId,
  updateUser,
  deleteUser,
} = require("../services/user");


async function getAuthenticatedUser(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const jwt = authHeader.split(" ")[1];
    const users = getUserUsers(jwt);

    const user = await users.get();
    return res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function initUserProfile(req, res) {
  try {
    const { name, bio = "", college = "", contact = "" } = req.body;
    const { appwriteId, email } = req.user;
    const file = req.file;

    // Check if user already exists
    const existingUser = await getUserByAppwriteId(appwriteId);
    if (existingUser) {
      return res.status(409).json({ message: "User profile already exists" });
    }

    // Compress avatar
    let avatarId = null;
    if (file) {
      const compressedImageBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: "cover" })
        .jpeg({ quality: 70 })
        .toBuffer();

      const uploaded = await getUserStorage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        ID.unique(),
        compressedImageBuffer,
        "image/jpeg",
        ["read:*"]
      );

      avatarId = uploaded.$id;
    }

    const createdUser = await createUser({
      appwriteId,
      name,
      email,
      avatar: avatarId,
      bio,
      college,
      contact,
    });

    res.status(201).json({
      message: "User profile created",
      user: createdUser,
    });
  } catch (error) {
    console.error("User init failed:", error);
    res.status(500).json({ error: "Failed to initialize user profile" });
  }
}

async function deleteUserAccount(req, res) {
  try {
    const appwriteId = req.user?.appwriteId;

    if (!appwriteId) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const existingUser = await getUserByAppwriteId(appwriteId);
    if (!existingUser || existingUser.isDeleted) {
      return res.status(404).json({ error: "User not found or already deleted" });
    }

    // Step 1: Cleanup all related products/images
    await cleanupUserProducts(appwriteId);

    // Step 2: Delete the user (from both Auth and DB)
    await deleteUser(appwriteId);

    return res.status(200).json({ message: "User and data deleted successfully." });
  } catch (error) {
    console.error("User deletion error:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: "Failed to delete user account." });
  }
}

async function updateUserProfile(req, res) {
  try {
    const appwriteId = req.user?.appwriteId;
    if (!appwriteId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const existingUser = await getUserByAppwriteId(appwriteId);
    if (!existingUser || existingUser.isDeleted) {
      return res.status(404).json({ error: "User not found or access denied (banned)" });
    }

    const { name, email, avatar, bio, college, contact } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;
    if (bio) updateData.bio = bio;
    if (college) updateData.college = college;
    if (contact) updateData.contact = contact;

    const updatedUser = await updateUser(appwriteId, updateData);

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
}

module.exports = {
  initUserProfile,
  deleteUserAccount,
  updateUserProfile,
  getAuthenticatedUser
};
