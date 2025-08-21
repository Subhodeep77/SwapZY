// config/appwrite.js
const sdk = require("node-appwrite");

function getUserServices(jwt) {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setJWT(jwt);

  return {
    account: new sdk.Account(client),
    ID: sdk.ID,
  };
}

function getAdminServices() {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // API key with "users.read" permission

  return {
    users: new sdk.Users(client),
    ID: sdk.ID,
  };
}

module.exports = { getUserServices, getAdminServices };
