// const { DefaultAzureCredential } = require('@azure/identity');
// const { Client } = require('pg');
// require('dotenv').config();

// async function getDbClient() {
//   const credential = new DefaultAzureCredential();
//   const tokenResponse = await credential.getToken("https://ossrdbms-aad.database.windows.net");

//   const client = new Client({
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: tokenResponse.token,
//     port: 5432,
//     ssl: { rejectUnauthorized: false }
//   });

//   await client.connect();
//   return client;
// }

// module.exports = getDbClient;

// utils/dbClient.js
const { DefaultAzureCredential } = require('@azure/identity');
const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' }); // explicitly load .env

let sharedClient = null;

async function getDbClient() {
  if (sharedClient) return sharedClient; // reuse existing client

  // Acquire Azure AD token
  const credential = new DefaultAzureCredential();
  const tokenResponse = await credential.getToken(
    'https://ossrdbms-aad.database.windows.net/.default'
  );

  if (!tokenResponse || !tokenResponse.token) {
    throw new Error('Failed to acquire Azure AD token. Check AZURE_* environment variables.');
  }

  // Read DB connection info from environment
  const dbHost = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;

  if (!dbHost || !dbName || !dbUser) {
    throw new Error('DB_HOST, DB_NAME, and DB_USER must be set in .env');
  }

  // Create PG client with Azure AD token as password
  sharedClient = new Client({
    host: dbHost,
    database: dbName,
    user: dbUser,
    password: tokenResponse.token,
    port: 5432,
    ssl: { rejectUnauthorized: false }, // required for Azure
  });

  await sharedClient.connect(); // <--- important! was missing
  return sharedClient;
}

// Close connection when done
async function closeDbClient() {
  if (sharedClient) {
    await sharedClient.end();
    sharedClient = null;
  }
}

module.exports = { getDbClient, closeDbClient };
