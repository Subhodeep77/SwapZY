// middlewares/optionalAppwriteToken.js
const sdk = require("node-appwrite");
require("dotenv").config();

const optionalAppwriteToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // Guest mode
  }

  const token = authHeader.split(" ")[1];

  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setJWT(token);

  const account = new sdk.Account(client);

  try {
    const user = await account.get();
    req.user = { appwriteId: user.$id, email: user.email };
  } catch (err) {
    console.warn("Optional auth failed, continuing as guest.");
  }

  next();
};

module.exports = optionalAppwriteToken;
