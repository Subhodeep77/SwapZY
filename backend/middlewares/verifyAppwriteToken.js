// middlewares/verifyAppwriteToken.js
const { users } = require("../config/appwrite");
const isStudentEmail = require("../utils/isStudentEmail");

const verifyAppwriteToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  req.user = null;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Get current user info from Appwrite
    const user = await users.get();

    // Check if the user's email is a student email
    if (!isStudentEmail(user.email)) {
      return res.status(403).json({
        error: "Access restricted to verified student email addresses.",
      });
    }

    // Attach user info to req.user for downstream usage
    req.user = {
      appwriteId: user.$id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyAppwriteToken;
