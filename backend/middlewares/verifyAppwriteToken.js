const { getUserServices } = require("../config/appwrite"); // path to your helper
const isStudentEmail = require("../utils/isStudentEmail");

const verifyAppwriteToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  try {
    console.log("🔐 Received JWT:", token);
    // console.log(
    //   "📛 Using Appwrite Project ID:",
    //   process.env.APPWRITE_PROJECT_ID
    // );
    //console.log("🌐 Using Appwrite Endpoint:", process.env.APPWRITE_ENDPOINT);
    const { account } = getUserServices(token);
    const user = await account.get();
    //console.log("User fetched:", user);
    //console.log("✅ Token valid, user:", user);
    if (!user?.email) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
     console.log("📧 Email to check:", user.email);
    if (!isStudentEmail(user.email)) {
      console.warn("⛔ Blocked: Non-student email", user.email);
      return res.status(403).json({ error: "Only student emails allowed" });
    }

    req.user = {
      appwriteId: user.$id,
      email: user.email,
      name: user.name,
      jwt: token,
    };
    
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ error: "Unauthorized access" });
  }
};

module.exports = verifyAppwriteToken;
