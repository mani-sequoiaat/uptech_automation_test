// // const getDbClient = require('../../utils/dbClient');
// const sharedClient = require('../../sharedClient');
// const getDbClient = require('../../utils/dbClient.js');
// const readSQLFile = require('../../utils/readSQLFile');
// require('dotenv').config();

// describe('file_details positive validation', () => {
//   // let client;

//   jest.setTimeout(25000); // increase global timeout

//   // beforeAll(async () => {
//   //   client = await getDbClient();
//   // }, 10000);

//   // afterAll(async () => {
//   //   await client.end();
//   // });


//   test("should find file with status 'silver to gold'", async () => {
//     const sql = readSQLFile('ra-management/sql/file-details.sql');
//     const client = await sharedClient.initClient();
//     if (!client) {
//       throw new Error('Shared DB client not initialized. Ensure index.test.js creates and sets the shared client before running tests.');
//     }
//     const result = await client.query(sql, [process.env.TARGET_FILENAME_RA]);

//     // Adjust these assertions to match your expected result shape
//     expect(result).toHaveProperty('rows');
//     expect(Array.isArray(result.rows)).toBe(true);

//     expect(result.rows.length).toBeGreaterThanOrEqual(0); // Allow both found and not found
//   });
// });

const { getDbClient } = require('../../utils/dbClient');
const { readSQLFile } = require('../../utils/readSQLFile');

test("should find file with status 'silver to gold'", async () => {
  const client = await getDbClient();
  const sql = readSQLFile('ra-management/sql/file-details.sql');
  const result = await client.query(sql, [process.env.TARGET_FILENAME_RA]);

  expect(result.rows.length).toBeGreaterThan(0); 
});
