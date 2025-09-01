const fs = require('fs');
const path = require('path');
const { getDbClient } = require('../../utils/dbClient');
const { readSQLFile } = require('../../utils/readSQLFile');
require('dotenv').config();

jest.setTimeout(20000);

const normalize = val => {
  if (val === null || val === undefined || val === '') return '';
  return String(val);
};

let client;
beforeAll(async () => {
  client = await getDbClient();
});

test('should match s_agreements count in DB with imported file record count', async () => {
  if (!process.env.TARGET_FILENAME_RA) {
    throw new Error('TARGET_FILENAME_RA is not set in the environment variables.');
  }
  
  // path to the count SQL (adjust if your file location is different)
  const countSqlPath = path.join(__dirname, '..', 'sql', 's-agreements-positive-count.sql');
  const countSql = readSQLFile(countSqlPath);

  // run count query with filename param
  const countRes = await client.query(countSql, [process.env.TARGET_FILENAME_RA]);
  const dbCountRow = countRes.rows[0] || {};
  const dbCount = dbCountRow.count !== undefined ? Number(dbCountRow.count)
    : dbCountRow.cnt !== undefined ? Number(dbCountRow.cnt)
      : Number(Object.values(dbCountRow)[0] || 0);

  // read imported file records (same JSON used by other test)
  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  const fileCount = Array.isArray(fileData) ? fileData.length : 0;

  expect(dbCount).toBe(fileCount);
});

test('3237: should match all s_agreements fields (except ignored ones) with input file records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3238: should have all records with non-null agreement_number', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3241: should have all records with brand existing in brand table', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3243: should have all records with non-null license_plate_number or license_plate_state', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3245: should have all records with license_plate_number not exceeding 12 characters', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3247: should have all records with license_plate_state equal to 2 characters', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3238: should have all records with non-null agreement_number', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3249: should have all records with null make records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3250: should have all records with non-null make records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3251: should have all records with null model records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3252: should have all records with non-null model records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3253: should have all records with null rental_customer_type_id records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3254: should have all records with non-null rental_customer_type_id records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3255: should have all records with null corporate_account records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
    
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3256: should have all records with non-null corporate_account records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3257: should have all records with null checkout_location_name records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3258: should have all records with non-null checkout_location_name records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3259: should have all records with null checkout_address_1 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3260: should have all records with non-null checkout_address_1 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3261: should have all records with null checkout_address_2 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3262: should have all records with non-null checkout_address_2 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3263: should have all records with null checkout_city records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3264: should have all records with non-null checkout_city records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3265: should have all records with null checkout_state records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3266: should have all records with non-null checkout_state records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3267: should have all records with null checkout_zip records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3268: should have all records with non-null checkout_zip records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkout_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3269: should have all records with null estimated_checkin_location_name records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3270: should have all records with non-null estimated_checkin_location_name records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3271: should have all records with null estimated_checkin_address_1 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3272: should have all records with non-null estimated_checkin_address_1 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3273: should have all records with null estimated_checkin_address_2 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3274: should have all records with non-null estimated_checkin_address_2 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3275: should have all records with null estimated_checkin_city records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3276: should have all records with non-null estimated_checkin_city records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3277: should have all records with null estimated_checkin_state records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3278: should have all records with non-null estimated_checkin_state records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3279: should have all records with null estimated_checkin_zip records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3280: should have all records with non-null estimated_checkin_zip records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'estimated_checkin_location_id', 'estimated_checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3281: should have all records with null checkin_location_name records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3282: should have all records with non-null checkin_location_name records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3283: should have all records with null checkin_address_1 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3284: should have all records with non-null checkin_address_1 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3285: should have all records with null checkin_address_2 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3286: should have all records with non-null checkin_address_2 records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3287: should have all records with null checkin_city records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3288: should have all records with non-null checkin_city records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3289: should have all records with null checkin_state records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3290: should have all records with non-null checkin_state records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3291: should have all records with null checkin_zip records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3292: should have all records with non-null checkin_zip records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3293: should have all records with null checkin_datetime records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3294: should have all records with non-null checkin_datetime records', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3300: should have all records with license_plate_state not having non-allowed special characters', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3302: should have all records with license_plate_state not having special characters', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3304: should have all records with estimated_checkin_datetime later than checkout_datetime', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3306: should have all records with checkout_datetime greater than current_date', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3308: should have all records with checkout_location_code as not null', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3305: should have all records with swap_indicator as null', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3304: should have all records with swap_indicator as not null', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3315: should have all records with swap_indicator as false and swap_datetime as null', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

test('3317: should have all records with swap_indicator as true and swap_datetime as not null', async () => {
  const sql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
  const dbResult = await client.query(sql, [process.env.TARGET_FILENAME_RA]);
  const dbRecords = dbResult.rows;

  const jsonFilePath = path.join(__dirname, '../../ra-management/sample-ra-generation', 'generated-valid-records.json');
  const fileData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  const ignoredFields = ['id', 'guid', 'batch_id', 'brand_id', 'checkin_location_id', 'checkin_location_id', 'checkin_location_id', 'fleet_as_of_date', 'created_at', 'updated_at'];

  expect(dbRecords.length).toBe(fileData.length);

  for (let i = 0; i < dbRecords.length; i++) {
    const dbRow = dbRecords[i];
    const fileRow = fileData[i];

    for (const key in fileRow) {
      if (!ignoredFields.includes(key)) {
        const dbValue = normalize(dbRow[key]);
        const fileValue = normalize(fileRow[key]);

        // Normalize to string for loose equality comparison
        if (String(dbValue) !== String(fileValue)) {
          console.error(`Mismatch at row ${i + 1}, field "${key}": DB="${dbValue}" vs File="${fileValue}"`);
        }

        expect(String(dbValue)).toBe(String(fileValue));
      }
    }
  }
});

