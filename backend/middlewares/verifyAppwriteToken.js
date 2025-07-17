// middlewares/verifyAppwriteToken.js
const sdk = require("node-appwrite");
const isStudentEmail = require("../utils/isStudentEmail");

const verifyAppwriteToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Recreate user-scoped client using JWT
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setJWT(token);

    const account = new sdk.Account(client);
    const user = await account.get();

    if (!user || !user.email) {
      throw new Error("Invalid JWT or user not found");
    }

    // ✅ Use your utility function here
    if (!isStudentEmail(user.email)) {
      return res.status(403).json({ error: "Only students allowed" });
    }

    req.user = {
      appwriteId: user.$id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyAppwriteToken;