// controllers/userController.js
const { cleanupUserProducts } = require("../utils/cleanup");
const { users, storage, ID, databases } = require("../config/appwrite"); // ✅ Use admin SDK
const sharp = require("sharp");
const { createUser, getUserByAppwriteId } = require("../services/user"); // Import both services

async function initUserProfile(req, res) {
  try {
    const { name, bio = "", college = "", contact = "" } = req.body;
    const { appwriteId, email } = req.user;
    const file = req.file;

    // Step 1: Check if user already exists
    const existingUser = await getUserByAppwriteId(appwriteId);
    if (existingUser) {
      return res.status(409).json({ message: "User profile already exists" });
    }

    // Step 2: Compress avatar if file provided
    let avatarId = null;
    if (file) {
      const compressedImageBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: "cover" })
        .jpeg({ quality: 70 })
        .toBuffer();

      const uploaded = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        ID.unique(),
        compressedImageBuffer,
        "image/jpeg",
        ["read:*"]
      );

      avatarId = uploaded.$id;
    }

    // Step 3: Create user profile
    const createdUser = await createUser({
      appwriteId,
      name,
      email,
      avatar: avatarId,
      bio,
      college,
      contact,
      // role omitted, uses default "USER"
    });

    res
      .status(201)
      .json({ message: "User profile created", user: createdUser });
  } catch (error) {
    console.error("User init failed:", error);
    res.status(500).json({ error: "Failed to initialize user profile" });
  }
}

async function deleteUserAccount(req, res) {
  try {
    const userId = req.user.appwriteId; // ✅ Extracted from token middleware

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // ✅ Step 1: Cleanup all related products/images
    await cleanupUserProducts(userId);

    // ✅ Step 2: Delete the user via Admin SDK
    await users.delete(userId); // 💥 Secure and correct way

    return res
      .status(200)
      .json({ message: "User and data deleted successfully." });
  } catch (error) {
    console.error("User deletion error:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: "Failed to delete user account." });
  }
}

const updateUserProfile = async (req, res) => {
  try {
    const appwriteId = req.user?.appwriteId;
    if (!appwriteId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const existingUser = await getUserByAppwriteId(appwriteId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, email, avatar, bio, college, contact } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;
    if (bio) updateData.bio = bio;
    if (college) updateData.college = college;
    if (contact) updateData.contact = contact;

    updateData.updatedAt = new Date().toISOString();

    const updatedUser = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USER_COLLECTION_ID,
      existingUser.$id, // ✅ Use correct doc ID here
      updateData
    );

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

module.exports = { initUserProfile, deleteUserAccount, updateUserProfile };
