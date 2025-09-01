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
require('dotenv').config();

let sharedClient = null;

async function getDbClient() {
  if (sharedClient) return sharedClient;

  const credential = new DefaultAzureCredential();
  const tokenResponse = await credential.getToken("https://ossrdbms-aad.database.windows.net");

  sharedClient = new Client({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: tokenResponse.token,
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  await sharedClient.connect();
  return sharedClient;
}

async function closeDbClient() {
  if (sharedClient) {
    await sharedClient.end();
    sharedClient = null;
  }
}

module.exports = { getDbClient, closeDbClient };