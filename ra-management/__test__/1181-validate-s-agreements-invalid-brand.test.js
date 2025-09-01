const getDbClient = require('../../utils/dbClient');
const readSQLFile = require('../../utils/readSQLFile');
require('dotenv').config();

describe('Integration: s_agreements_error - Invalid Brand (error_type_id = 1181)', () => {
  let client;

  jest.setTimeout(15000); // increase global timeout

  beforeAll(async () => {
    client = await getDbClient();
  }, 10000);

  afterAll(async () => {
    await client.end();
  });

  test('should detect records with invalid brand in s_agreements_error', async () => {
    const sql = readSQLFile('ra-management/sql/1181-s-agreements-invalid-brand');
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
