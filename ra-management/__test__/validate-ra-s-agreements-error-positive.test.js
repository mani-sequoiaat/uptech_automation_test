const getDbClient = require('../../utils/dbClient');
const readSQLFile = require('../../utils/readSQLFile');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

describe('Integration: s_agreements_error - Positive Invalid Records Validation', () => {
  let client;

  jest.setTimeout(25000); // Increase timeout for DB + file operations

  beforeAll(async () => {
    client = await getDbClient();
  });

  afterAll(async () => {
    await client.end();
  });

  test('should exactly match invalid records in DB with generated-invalid-records.json', async () => {
    const sql = readSQLFile('ra-management/sql/s-agreements-error-positive.sql');
    const result = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
    const dbRecords = result.rows;

    // Load generated-invalid-records.json
    const filePath = path.join(__dirname, '../../../ra-management/sample-ra-generation/generated-invalid-records.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fileRecords = JSON.parse(fileContent);

    // Helper: Normalize record for fair comparison
    const normalize = (rec) => {
      const normalized = { ...rec };
      Object.keys(normalized).forEach(key => {
        if (typeof normalized[key] === 'string') {
          normalized[key] = normalized[key].trim();
        }
        if (normalized[key] === '') {
          normalized[key] = null;
        }
      });
      return normalized;
    };

    const normalizedDbRecords = dbRecords.map(normalize);
    const normalizedFileRecords = fileRecords.map(normalize);

    // Sort both lists for deterministic comparison
    const sortFn = (a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b));
    normalizedDbRecords.sort(sortFn);
    normalizedFileRecords.sort(sortFn);

    // Stringify for deep equality check
    const dbJson = JSON.stringify(normalizedDbRecords);
    const fileJson = JSON.stringify(normalizedFileRecords);

    // Log summary
    console.log(`DB record count: ${normalizedDbRecords.length}`);
    console.log(`File record count: ${normalizedFileRecords.length}`);

    // If mismatch, show diffs
    if (dbJson !== fileJson) {
      const mismatches = normalizedFileRecords.filter(
        fileRec => !normalizedDbRecords.some(dbRec => JSON.stringify(dbRec) === JSON.stringify(fileRec))
      );
      console.warn('Mismatched Records:', mismatches);
    }

    // Assertions (exact match)
    expect(dbJson).toEqual(fileJson);
    expect(normalizedDbRecords.length).toBe(normalizedFileRecords.length);
  });
});
