// middlewares/isAdmin.js
const { getUserByAppwriteId } = require("../services/user");

const isAdmin = async (req, res, next) => {
  try {
    const { appwriteId } = req.user;

    const user = await getUserByAppwriteId(appwriteId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    next();
  } catch (error) {
    console.error("Admin check failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = isAdmin;
