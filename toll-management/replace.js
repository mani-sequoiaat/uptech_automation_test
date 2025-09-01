  test('3257: should have all records with null checkin_location_name records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3258: should have all records with non-null checkin_location_name records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3259: should have all records with null checkin_address_1 records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3260: should have all records with non-null checkin_address_1 records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3261: should have all records with null checkin_address_2 records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3262: should have all records with non-null checkin_address_2 records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3263: should have all records with null checkin_city records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3264: should have all records with non-null checkin_city records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3265: should have all records with null checkin_state records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3266: should have all records with non-null checkin_state records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3267: should have all records with null checkin_zip records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });

  test('3268: should have all records with non-null checkin_zip records', async () => {
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

    console.log('All non-ignored fields match between DB and input file.');
  });