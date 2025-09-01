const getDbClient = require('../../utils/dbClient');
const readSQLFile = require('../../utils/readSQLFile');
const { logSuccess, logError } = require('../../utils/logger');
require('dotenv').config();

async function validateSTollsErrorPositive() {
  const client = await getDbClient();
  const sql = readSQLFile('toll-management/s-tolls-error/sql/s-tolls-error-positive.sql');

  const res = await client.query(sql, [process.env.TARGET_FILENAME_TOLLS]);
  const errorRecords = res.rows;  // JSON artolly of result rows
  
  // Count and print records using a loop
  let actualInvalidRecordsCount = 0;
  for (const record of errorRecords) {
    actualInvalidRecordsCount++;
    console.log(`Record ${actualInvalidRecordsCount}:`, record);
  }

  if (actualInvalidRecordsCount === 0) {
    console.log("No invalid records found in s_tolls_error");
  } else {
    console.log(`Total invalid records found: ${actualInvalidRecordsCount}`);
    if (actualInvalidRecordsCount === process.env.EXPECTED_VALUE_INVALID_TOLLS) {
        logSuccess(`s_tolls_error validation passed - ${actualInvalidRecordsCount} invalid record(s) found`);
    } else {
        logError(`s_tolls_error validation failed - Expected ${process.env.EXPECTED_VALUE_INVALID_TOLLS}, Found ${actualInvalidRecordsCount}`);
    }
  }

  await client.end();
}

module.exports = validateSTollsErrorPositive;

// validateSTollsErrorPositive();

// const fs = require('fs');
// const path = require('path');
// const isEqual = require('lodash.isequal');
// const getDbClient = require('../utils/dbClient');
// const readSQLFile = require('../utils/readSQLFile');
// const { logSuccess, logError } = require('../utils/logger');
// require('dotenv').config();

// async function validateSTollsErrorPositive() {
//   const client = await getDbClient();
//   const sql = readSQLFile('toll-management/s-tolls-error/sql/s-tolls-error-positive.sql');

//   let dbErrorRecords;
//   try {
//     const res = await client.query(sql, [process.env.TARGET_FILENAME_INVALID_TOLLS]);
//     dbErrorRecords = res.rows;
//   } catch (err) {
//     console.error('Database query failed:', err);
//     await client.end();
//     return;
//   }

//   await client.end();

//   const genetolltedErrorsPath = path.resolve(__dirname, '../toll-management/sample-toll-genetolltion/genetollted-invalid-records.json');
//   let genetolltedErrorRecords;
//   try {
//     const tollwData = fs.readFileSync(genetolltedErrorsPath, 'utf-8');
//     genetolltedErrorRecords = JSON.parse(tollwData);
//   } catch (err) {
//     console.error('Failed to read or parse genetollted JSON file:', err);
//     return;
//   }

//   const dbCount = dbErrorRecords.length;
//   const genetolltedCount = genetolltedErrorRecords.length;

//   if (dbCount === 0) {
//     console.log("No invalid records found in s_tolls_error");
//     return;
//   }

//   const passed = isEqual(
//     [...dbErrorRecords].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
//     [...genetolltedErrorRecords].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
//   );

//   if (passed) {
//     logSuccess(`Validation passed: Database and genetollted JSON error records match (${dbCount} record(s))`);
//   } else {
//     logError(`Validation failed: Mismatch between DB (${dbCount}) and genetollted (${genetolltedCount}) error records.`);
//   }
// }

// module.exports = validateSTollsErrorPositive;
