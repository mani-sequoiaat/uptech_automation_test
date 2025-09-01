const getDbClient = require('../../utils/dbClient');
const readSQLFile = require('../../utils/readSQLFile');
const { logSuccess, logError } = require('../../utils/logger');
require('dotenv').config();

async function validateBAgreements() {
  const client = await getDbClient();
  const sql = readSQLFile('toll-management/b-tolls-ntta/sql/b-tolls-positive.sql');

  const res = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  if (res.rows.length === 0) {
    logSuccess("b-tolls-ntta validation passed (no rows found).");
  } else {
    logError("b-tolls-ntta validation failed: Unexpected rows present.");
  }

  await client.end();
}

module.exports = validateBAgreements;
