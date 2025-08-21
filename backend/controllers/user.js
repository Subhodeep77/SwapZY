const User = require("../models/User");
const { getGravatarUrl } = require("../utils/avatar");
const cascadeDeleteUser = require("../utils/cascadeDeletion");

/**
 * @desc   Create a new user profile
 * @route  POST /api/users/init
 */
const initUser = async (req, res) => {
  try {
    const { appwriteId, email } = req.user;
    const { name, bio = "", college = "", contact = "" } = req.body;

    if (!appwriteId || !email) {
      return res.status(400).json({ message: "Missing appwriteId or email" });
    }

    const existingUser = await User.findOne({ appwriteId });
    if (existingUser) {
      return res.status(200).json({ user: existingUser, message: "User already exists" });
    }

    const avatarPath = req.file?.path || req.body.avatar || getGravatarUrl(email);

    const newUser = new User({
      appwriteId,
      name,
      email,
      avatar: avatarPath,
      bio,
      college,
      contact,
    });

    await newUser.save();
    return res.status(201).json({ user: newUser });
  } catch (error) {
    console.error("Init user failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc   Update user profile
 * @route  PUT /api/users/user/update
 */
const updateUser = async (req, res) => {
  try {
    const { appwriteId, name, bio, college, contact } = req.body;
    if (!appwriteId) return res.status(400).json({ message: "Missing appwriteId" });

    const user = await User.findOne({ appwriteId });
    if (!user || user.isDeleted) return res.status(404).json({ message: "User not found" });

    // Update fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (contact !== undefined) user.contact = contact;

    // Avatar uploaded via multer (Cloudinary)
    if (req.file?.path) {
      user.avatar = req.file.path;
    }

    await user.save();
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc   Get user profile by appwriteId
 * @route  GET /api/users/:appwriteId
 */
const getUserByAppwriteId = async (req, res) => {
  try {
    console.log("👉 URL:", req.originalUrl);
    console.log("👉 Params:", req.params);
    console.log("👉 Query:", req.query);
    const { appwriteId } = req.params;
    const user = await User.findOne({ appwriteId, isDeleted: false });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get user failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc   Soft delete user
 * @route  DELETE /api/users/:appwriteId
 */
const softDeleteUser = async (req, res) => {
  try {
    const { appwriteId } = req.params;
    const user = await User.findOneAndUpdate(
      { appwriteId },
      { isDeleted: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User deleted", user });
  } catch (error) {
    console.error("Delete user failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc   Restore a soft-deleted user
 * @route  PATCH /api/users/restore/:appwriteId
 */
const restoreUser = async (req, res) => {
  try {
    const { appwriteId } = req.params;

    const user = await User.findOne({ appwriteId });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isDeleted) {
      return res.status(400).json({ message: "User is not deleted" });
    }

    user.isDeleted = false;
    await user.save();

    return res.status(200).json({ message: "User restored successfully", user });
  } catch (error) {
    console.error("Restore user failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc   Permanently delete a user from the database
 * @route  DELETE /api/users/hard/:appwriteId
 */

const deleteUser = async (req, res) => {
  try {
    const { appwriteId } = req.params;

    const user = await User.findOneAndDelete({ appwriteId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 Cascade delete everything owned by this user
    await cascadeDeleteUser(appwriteId);

    return res.status(200).json({ message: "User permanently deleted", user });
  } catch (error) {
    console.error("Hard delete user failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  initUser,
  updateUser,
  getUserByAppwriteId,
  softDeleteUser,
  restoreUser,
  deleteUser
};
