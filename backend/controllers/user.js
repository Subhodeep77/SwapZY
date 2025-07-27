// controllers/user.js
const { cleanupUserProducts } = require("../utils/cleanup");
const { getUserServices } = require("../config/appwrite");
const axios = require("axios");
const sharp = require("sharp");
const {
  createUser,
  getUserByAppwriteId,
  updateUser,
  deleteUser,
} = require("../services/user");

// ✅ Util to extract JWT
const extractJwt = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};

async function getAuthenticatedUser(req, res) {
  try {
    const jwt = extractJwt(req);
    if (!jwt) return res.status(401).json({ error: "Missing or invalid Authorization header" });

    const { users } = getUserServices(jwt);
    const user = await users.get();
    return res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: err.message });
  }
}

async function initUserProfile(req, res) {
  try {
    const jwt = extractJwt(req);
    if (!jwt) return res.status(401).json({ error: "Unauthorized" });

    const { name, bio = "", college = "", contact = "" } = req.body;
    const { appwriteId, email } = req.user;

    // Check if user already exists
    const existingUser = await getUserByAppwriteId(jwt, appwriteId);
    if (existingUser) {
      return res.status(409).json({ message: "User profile already exists" });
    }

    // 🎨 Get avatar from DiceBear
    const avatarUrl = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(name)}&backgroundColor=ffd5dc,b6e3f4,c0aede,d1d4f9`;
    const avatarRes = await axios.get(avatarUrl, { responseType: "arraybuffer" });

    // 📦 Compress avatar using sharp
    const compressedBuffer = await sharp(avatarRes.data)
      .resize(300, 300)
      .png({ quality: 80 })
      .toBuffer();

    // 📁 Upload directly using Appwrite SDK
    const { storage, ID, Permission, Role } = getUserServices(jwt);

    const uploadedAvatar = await storage.createFile(
      process.env.APPWRITE_BUCKET_ID,
      ID.unique(),
      Buffer.from(compressedBuffer),
      "image/png",
      [Permission.read(Role.any())]
    );

    const avatarId = uploadedAvatar.$id;

    // ✅ Create DB user
    const createdUser = await createUser(jwt, {
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
    const jwt = extractJwt(req);
    if (!jwt) return res.status(401).json({ error: "Unauthorized" });

    const appwriteId = req.user?.appwriteId;
    if (!appwriteId) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const existingUser = await getUserByAppwriteId(jwt, appwriteId);
    if (!existingUser || existingUser.isDeleted) {
      return res.status(404).json({ error: "User not found or already deleted" });
    }

    // Step 1: Cleanup all related products/images
    await cleanupUserProducts(appwriteId);

    // Step 2: Delete the user (from both Auth and DB)
    await deleteUser(jwt, appwriteId);

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
    const jwt = extractJwt(req);
    if (!jwt) return res.status(401).json({ error: "Unauthorized" });

    const appwriteId = req.user?.appwriteId;
    if (!appwriteId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const existingUser = await getUserByAppwriteId(jwt, appwriteId);
    if (!existingUser || existingUser.isDeleted) {
      return res.status(404).json({ error: "User not found or access denied (banned)" });
    }

    const { name, email, avatar, bio, college, contact } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio) updateData.bio = bio;
    if (college) updateData.college = college;
    if (contact) updateData.contact = contact;

    // 🎨 Auto-generate avatar if not provided and name is updated
    if (!avatar && name) {
      const avatarUrl = `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(name)}&backgroundColor=ffd5dc,b6e3f4,c0aede,d1d4f9`;
      const avatarRes = await axios.get(avatarUrl, { responseType: "arraybuffer" });

      const compressedBuffer = await sharp(avatarRes.data)
        .resize(300, 300)
        .png({ quality: 80 })
        .toBuffer();

      const { storage, ID, Permission, Role } = getUserServices(jwt);

      const uploadedAvatar = await storage.createFile(
        process.env.APPWRITE_BUCKET_ID,
        ID.unique(),
        Buffer.from(compressedBuffer),
        "image/png",
        [Permission.read(Role.any())]
      );

      updateData.avatar = uploadedAvatar.$id;
    } else if (avatar) {
      updateData.avatar = avatar;
    }

    const updatedUser = await updateUser(jwt, appwriteId, updateData);

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
  getAuthenticatedUser,
};