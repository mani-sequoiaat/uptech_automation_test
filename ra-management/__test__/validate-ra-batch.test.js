// const getDbClient = require('../../utils/dbClient');
// const sharedClient = require('../../sharedClient');
// const readSQLFile = require('../../utils/readSQLFile');
// const { logSuccess, logError } = require('../../utils/logger');
// require('dotenv').config();

// describe('batch positive validation', () => {
//   const client = sharedClient.initClient();
//   jest.setTimeout(15000); 

//   test('should contain all expected batch types marked as finished', async () => {
//     const sql = readSQLFile('ra-management/sql/batch.sql');
//     const expectedBatchTypes = ['bronze to silver', 'silver to gold'];

//     try {
//       const res = await client.query(sql, [process.env.TARGET_FILENAME_RA, expectedBatchTypes]);
//       const found = res.rows.map(r => r.name);
//       const missing = expectedBatchTypes.filter(e => !found.includes(e));

//       // Jest assertion
//       expect(missing).toEqual([]);
//     } catch (error) {
//       logError(`Error querying batch table: ${error.message}`);
//       throw error;
//     }
//   });
// });

const { getDbClient } = require('../../utils/dbClient');
const { readSQLFile } = require('../../utils/readSQLFile');
require('dotenv').config();

jest.setTimeout(15000); // increase timeout for DB operations

test('should contain all expected batch types marked as finished', async () => {
  const client = await getDbClient(); // singleton client
  const sql = readSQLFile('ra-management/sql/batch.sql');
  const expectedBatchTypes = ['bronze to silver', 'silver to gold'];

  const res = await client.query(sql, [process.env.TARGET_FILENAME_RA, expectedBatchTypes]);
  const found = res.rows.map(r => r.name);
  const missing = expectedBatchTypes.filter(e => !found.includes(e));

  expect(missing).toEqual([]);// assert all expected batch types found
});
