const {
  getUserByAppwriteId,
  getAllUsersFromDatabase,
  updateUser,
  softDeleteUser,
} = require("../services/user");

const getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const users = await getAllUsersFromDatabase({ limit, offset });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Failed to fetch users:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getUserDetailsByAppwriteId = async (req, res) => {
  const { appwriteId } = req.params;

  try {
    const user = await getUserByAppwriteId(appwriteId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Failed to fetch user:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

const softDeleteUserByAppwriteId = async (req, res) => {
  const { appwriteId } = req.params;

  try {
    const result = await softDeleteUser(appwriteId);
    res.json({
      success: true,
      message: "User soft-deleted successfully",
      user: result,
    });
  } catch (error) {
    console.error("Soft delete failed:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// 🔐 Admin-controlled update for role and isDeleted
const updateUserByAdmin = async (req, res) => {
  const { appwriteId } = req.params;
  const { name, email, avatar, bio, college, contact, role, isDeleted } = req.body;

  try {
    // Optional: check for proper admin access using middleware before this
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar) updates.avatar = avatar;
    if (bio) updates.bio = bio;
    if (college) updates.college = college;
    if (contact) updates.contact = contact;

    // Only allow valid roles
    if (role && ["USER", "ADMIN"].includes(role)) updates.role = role;

    // Allow toggling isDeleted only if boolean
    if (typeof isDeleted === "boolean") updates.isDeleted = isDeleted;

    const updatedUser = await updateUser(appwriteId, updates);
    res.json({
      success: true,
      message: "User updated by admin",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin update failed:", error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserDetailsByAppwriteId,
  softDeleteUserByAppwriteId,
  updateUserByAdmin, // 🆕 Add this to your admin routes
};
