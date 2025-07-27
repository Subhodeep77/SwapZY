// middlewares/verifyAppwriteToken.js
const sdk = require("node-appwrite");
const isStudentEmail = require("../utils/isStudentEmail");

const verifyAppwriteToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    console.log("🔐 Received JWT:", token);
    console.log(
      "📛 Using Appwrite Project ID:",
      process.env.APPWRITE_PROJECT_ID
    );
    console.log("🌐 Using Appwrite Endpoint:", process.env.APPWRITE_ENDPOINT);

    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setJWT(token);

    const account = new sdk.Account(client);
    const user = await account.get();
    console.log("✅ Token valid, user:", user);

    if (!user || !user.email) {
      throw new Error("Invalid JWT or user not found");
    }

    console.log("📧 Email to check:", user.email);
    if (!isStudentEmail(user.email)) {
      console.warn("⛔ Blocked: Non-student email", user.email);
      return res.status(403).json({ error: "Only students allowed" });
    }

    req.user = {
      appwriteId: user.$id,
      email: user.email,
      name: user.name,
      jwt: token,
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyAppwriteToken;
