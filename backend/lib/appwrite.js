require('dotenv').config();

const sdk = require('node-appwrite');

const client = new sdk.Client()
  .setEndpoint(process.env.APPWRITE_PUBLIC_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_DATABASE_KEY);

exports.databases = new sdk.Databases(client);
exports.storage = new sdk.Storage(client);
