const getDbClient = require('../../utils/dbClient');
const readSQLFile = require('../../utils/readSQLFile');
const { logSuccess, logError } = require('../../utils/logger');
require('dotenv').config();

async function validateBatch() {
  const client = await getDbClient();
  const sql = readSQLFile('toll-management/batch/sql/batch.sql');
  const expectedBatchTypes = ['bronze to silver', 'silver to gold'];

  const res = await client.query(sql, [process.env.TARGET_FILENAME_TOLLS, expectedBatchTypes]);
  const found = res.rows.map(r => r.name);
  const missing = expectedBatchTypes.filter(e => !found.includes(e));

  if (missing.length === 0) {
    logSuccess("All expected batch types found and finished.");
  } else {
    logError(`Missing batch types: ${missing.join(', ')}`);
  }

  await client.end();
}

module.exports = validateBatch;