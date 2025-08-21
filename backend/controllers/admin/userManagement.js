// controllers/admin/userManagement.js
const {
  getUserByAppwriteId,
  updateUser,
  softDeleteUser,
  restoreUser // ✅ Import restoreUser from user.js
} = require("../user"); // importing directly from controllers/user.js

const User = require("../../models/User");

// GET all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { role, isDeleted, college, search } = req.query;

    const parsedIsDeleted =
      typeof isDeleted === "undefined" ? false : isDeleted === "true";

    const query = {};
    if (role) query.role = role;
    if (college) query.college = college;
    if (parsedIsDeleted !== undefined) query.isDeleted = parsedIsDeleted;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      User.find(query).skip(offset).limit(limit).lean(),
      User.countDocuments(query),
    ]);

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
const getUserDetailsByAppwriteId = (req, res) => {
  return getUserByAppwriteId(req, res);
};

// DELETE (soft delete) user by Appwrite ID
const softDeleteUserByAppwriteId = (req, res) => {
  return softDeleteUser(req, res);
};

// PATCH restore soft-deleted user by Appwrite ID ✅
const restoreUserByAppwriteId = (req, res) => {
  return restoreUser(req, res);
};

// PUT update user fields by admin
const updateUserByAdmin = async (req, res) => {
  try {
    await updateUser(req, res);
  } catch (error) {
    console.error("Admin update failed:", error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserDetailsByAppwriteId,
  softDeleteUserByAppwriteId,
  restoreUserByAppwriteId, // ✅ Export for admin routes
  updateUserByAdmin,
};
