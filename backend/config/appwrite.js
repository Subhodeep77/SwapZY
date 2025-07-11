const { Client, Databases, Storage, Users, ID, Query } = require("node-appwrite");
require("dotenv").config();

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID);

// Initialize Services using API key as second argument
const users = new Users(client, process.env.APPWRITE_API_KEY);
const storage = new Storage(client, process.env.APPWRITE_API_KEY);
const databases = new Databases(client, process.env.APPWRITE_API_KEY); // ✅ Add this for database access

module.exports = {
  client,
  users,
  storage,
  databases,
  ID,
  Query
};
