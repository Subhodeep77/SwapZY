const { Client, Databases, Storage, Users, ID, Query } = require("node-appwrite");
require("dotenv").config();

function getUserClient(jwt) {
  return new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setJWT(jwt);
}

function getUserServices(jwt) {
  const client = getUserClient(jwt);

  return {
    client,
    users: new Users(client),
    databases: new Databases(client),
    storage: new Storage(client),
    ID,
    Query,
  };
}

module.exports = {
  getUserClient,
  getUserServices,
};
