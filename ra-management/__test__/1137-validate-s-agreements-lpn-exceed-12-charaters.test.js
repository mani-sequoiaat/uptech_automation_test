const getDbClient = require('../../utils/dbClient');
const readSQLFile = require('../../utils/readSQLFile');
require('dotenv').config();

describe('Integration: s_agreements_error - LPN exceeds 12 characters', () => {
  let client;

  jest.setTimeout(15000); // increase global timeout

  beforeAll(async () => {
    client = await getDbClient();
  }, 10000);

  afterAll(async () => {
    await client.end();
  });

  test('should detect expected count of LPNs longer than 12 characters', async () => {
    const sql = readSQLFile('ra-management/sql/1137-s-agreements-lpn-exceed-12-charaters');
    const result = await client.query(sql, [process.env.TARGET_FILENAME_RA]);

    const errorRecords = result.rows;
    const actualInvalidCount = errorRecords.length;
    const expectedInvalidCount = 1;

    errorRecords.forEach((record, index) => {
      console.log(`Invalid Record ${index + 1}:`, record);
    });

    if (actualInvalidCount === 0) {
      console.log('No invalid records found in s_agreements_error');
    } else {
      console.log(`Total invalid records found: ${actualInvalidCount}`);
    }

    expect(actualInvalidCount).toBe(expectedInvalidCount);
  });
});
