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

module.exports = { getUserServices };
