const { getUserServices } = require("../config/appwrite");
const User = require("../models/User"); // MongoDB user model

const isAdmin = async (req, res, next) => {
  //console.log("🟡 [isAdmin] Incoming request:", req.method, req.originalUrl);

  try {
    const authHeader = req.headers["authorization"];
    const jwt = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;
    //console.log("🔐 [isAdmin] Extracted JWT:", jwt);

    if (!jwt) {
      console.warn("⛔ [isAdmin] No JWT found in headers.");
      return res.status(401).json({ error: "Missing or invalid JWT" });
    }

    const { account } = getUserServices(jwt);
    const appwriteUser = await account.get();
    //console.log("✅ [isAdmin] Appwrite user fetched:", appwriteUser);

    if (!appwriteUser || !appwriteUser.$id) {
      console.warn("⛔ [isAdmin] Invalid Appwrite user");
      return res.status(403).json({ error: "Invalid Appwrite user" });
    }

    const mongoUser = await User.findOne({ appwriteId: appwriteUser.$id }).lean();
    //console.log("✅ [isAdmin] MongoDB user fetched:", mongoUser);

    if (!mongoUser) {
      console.warn("⛔ [isAdmin] User not found in MongoDB:", appwriteUser.$id);
      return res.status(404).json({ error: "User not found in database" });
    }

    // Only allow active admins
    if (mongoUser.role !== "ADMIN" || mongoUser.isDeleted) {
      console.warn("⛔ [isAdmin] Forbidden, user is not admin or is banned:", mongoUser.role, "isDeleted:", mongoUser.isDeleted);
      return res.status(403).json({ error: "Forbidden: Admins only or banned" });
    }

    req.user = {
      appwriteId: mongoUser.appwriteId,
      name: mongoUser.name,
      email: mongoUser.email,
      role: mongoUser.role,
    };

    console.log("✅ [isAdmin] User is active ADMIN, moving forward.");
    next();
  } catch (error) {
    console.error("❌ [isAdmin] Admin check failed:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = isAdmin;
