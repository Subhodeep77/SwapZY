// middlewares/optionalAppwriteToken.js
const sdk = require("node-appwrite");

const optionalAppwriteToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(); // Guest mode

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
