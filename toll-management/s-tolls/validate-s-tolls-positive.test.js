const getDbClient = require('../../utils/dbClient');
const readSQLFile = require('../../utils/readSQLFile');
const { logSuccess, logError } = require('../../utils/logger');
require('dotenv').config();

async function validateSTollsPositive() {
  const client = await getDbClient();
  const sql = readSQLFile('toll-management/s-tolls/sql/s-tolls-positive.sql');

  const res = await client.query(sql, [process.env.TARGET_FILENAME_TOLLS]);
  const actualValidRecordsCount = parseInt(res.rows[0].count, 10);

  if (actualValidRecordsCount === process.env.EXPECTED_VALUE_TOLLS) {
    logSuccess(`s_tolls validation passed - ${actualValidRecordsCount} valid record(s) found`);
  } else {
    logError(`s_tolls validation failed - Expected ${process.env.EXPECTED_VALUE_TOLLS}, Found ${actualValidRecordsCount}`);
  }

  await client.end();
}

module.exports = validateSTollsPositive;
