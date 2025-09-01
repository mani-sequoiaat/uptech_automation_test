const getDbClient = require('../../utils/dbClient');
const readSQLFile = require('../../utils/readSQLFile');
const { logSuccess, logError } = require('../../utils/logger');
require('dotenv').config();

async function validateFileDetails() {
  const client = await getDbClient();
  const sql = readSQLFile('toll-management/file-details/sql/file-details.sql');

  const res = await client.query(sql, [process.env.TARGET_FILENAME_TOLLS]);

  if (res.rows.length === 0) {
    logError("File not found or not in 'silver to gold' status.");
  } else {
    logSuccess("File found with status 'silver to gold'.");
  }

  await client.end();
}

module.exports = validateFileDetails;