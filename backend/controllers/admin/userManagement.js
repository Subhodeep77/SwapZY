const {
  getUserByAppwriteId,
  getAllUsersFromDatabase,
  updateUser,
  softDeleteUser,
} = require("../../services/user");

// GET all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { role, isDeleted, college, search } = req.query;

    const parsedIsDeleted =
      typeof isDeleted === "undefined" ? false : isDeleted === "true";

    const { users, totalCount } = await getAllUsersFromDatabase({
      limit,
      offset,
      role,
      isDeleted: parsedIsDeleted,
      college,
      search,
    });

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// GET user by Appwrite ID
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

// DELETE (soft delete) user by Appwrite ID
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

// PUT update user fields by admin
const updateUserByAdmin = async (req, res) => {
  const { appwriteId } = req.params;
  const { name, email, avatar, bio, college, contact, role, isDeleted } = req.body;

  try {
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (avatar) updates.avatar = avatar;
    if (bio) updates.bio = bio;
    if (college) updates.college = college;
    if (contact) updates.contact = contact;
    if (role && ["USER", "ADMIN"].includes(role)) updates.role = role;
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
  updateUserByAdmin,
};
