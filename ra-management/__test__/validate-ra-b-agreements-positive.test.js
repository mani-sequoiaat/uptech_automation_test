// const getDbClient = require('../../utils/dbClient');
// const sharedClient = require('../../sharedClient');
// const readSQLFile = require('../../utils/readSQLFile');
// const { logSuccess, logError } = require('../../utils/logger');
// require('dotenv').config();

// describe('b_agreements positive validation', () => {
//   const client = sharedClient.initClient();

//   jest.setTimeout(15000);

//   test('3234: should return 0 unexpected rows in b_agreements table', async () => {
//     const sql = readSQLFile('ra-management/sql/b-agreements-positive.sql');

//     try {
//       const res = await client.query(sql, [process.env.TARGET_FILENAME_RA]);

//       expect(Array.isArray(res.rows)).toBe(true);

//       // if (res.rows.length === 0) {
//       //   logSuccess("b_agreements validation passed (no rows found).");
//       // } else {
//       //   logError(`b_agreements validation failed: ${res.rows.length} unexpected row(s) found.`);
//       // }

//       expect(res.rows.length).toBe(0); 
//     } catch (error) {
//       logError(`Database query failed: ${error.message}`);
//       throw error;
//     }
//   });
// });

const { getDbClient } = require('../../utils/dbClient');
const { readSQLFile } = require('../../utils/readSQLFile');
require('dotenv').config();

jest.setTimeout(15000); // increase timeout for DB queries

test('3234: should return 0 unexpected rows in b_agreements table', async () => {
  const client = await getDbClient(); // singleton DB client
  const sql = readSQLFile('ra-management/sql/b-agreements-positive.sql');

  const res = await client.query(sql, [process.env.TARGET_FILENAME_RA]);

  // Validate the result
  expect(Array.isArray(res.rows)).toBe(true);
  expect(res.rows.length).toBe(0); // no unexpected rows
});
