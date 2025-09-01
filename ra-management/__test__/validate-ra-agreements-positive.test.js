const fs = require('fs');
const path = require('path');
const { getDbClient } = require('../../utils/dbClient');
const { readSQLFile } = require('../../utils/readSQLFile');
require('dotenv').config();

const filename = process.env.TARGET_FILENAME_RA;

jest.setTimeout(50000); // increase timeout if needed

let client;
beforeAll(async () => {
  client = await getDbClient();
});
// Refactor this method to use luxon 
const formatDateTime = val => {
  if (val === null || val === undefined || val === '') return '';
  if (val instanceof Date) {
    const pad = n => String(n).padStart(2, '0');
    return `${val.getFullYear()}-${pad(val.getMonth() + 1)}-${pad(val.getDate())} ${pad(val.getHours())}:${pad(val.getMinutes())}:${pad(val.getSeconds())}`;
  }
  if (typeof val === 'string') {
    const parsed = new Date(val);
    if (!isNaN(parsed)) {
      const pad = n => String(n).padStart(2, '0');
      return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
    }
    return val.trim();
  }
  return String(val);
};

test(`should match record counts between agreements and s_agreements for file: ${filename}`, async () => {
  // Refactor to remove try catch
  try {
    if (!filename) {
      throw new Error('TARGET_FILENAME_RA is not set in the environment variables.');
    }

    // Read SQL files (use path relative to this test file)
    const agreementsCountSqlPath = path.join(__dirname, '..', 'sql', 'agreements-positive-count.sql');
    const sAgreementsCountSqlPath = path.join(__dirname, '..', 'sql', 's-agreements-positive-count.sql');

    const agreementsCountSql = readSQLFile(agreementsCountSqlPath);
    const sAgreementsCountSql = readSQLFile(sAgreementsCountSqlPath);

    // Execute queries passing filename as parameter
    const agreementsCountRes = await client.query(agreementsCountSql, [filename]);
    const sAgreementsCountRes = await client.query(sAgreementsCountSql, [filename]);

    // Extract numeric counts from first row (handle different column names)
    const getCountFromRow = row => {
      if (!row) return 0;
      if (row.count !== undefined) return Number(row.count);
      if (row.cnt !== undefined) return Number(row.cnt);
      const firstVal = Object.values(row)[0];
      return firstVal === undefined || firstVal === null ? 0 : Number(firstVal);
    };

    const agreementsCount = getCountFromRow(agreementsCountRes.rows[0]);
    const sAgreementsCount = getCountFromRow(sAgreementsCountRes.rows[0]);

    expect(agreementsCount).toBe(sAgreementsCount);
  } catch (error) {
    logError(`Count comparison test failed for file "${filename}": ${error.message}`);
    throw error;
  }
});

test(`3325: should validate each column from s-agreements against agreements for file: ${filename}`, async () => {
  try {
    if (!filename) {
      throw new Error('TARGET_FILENAME_RA is not set in the environment variables.');
    }

    // Step 1: Read and run the s-agreements (expected) SQL with file name as parameter
    const stagingSql = readSQLFile('ra-management/sql/s-agreements-positive.sql');
    const stagingResult = await client.query(stagingSql, [filename]);
    const stagingRows = stagingResult.rows;

    // Step 2: Read and run the agreements (actual) SQL
    const agreementsSql = readSQLFile('ra-management/sql/agreements-positive.sql');
    const agreementsResult = await client.query(agreementsSql, [filename]);
    const agreementRows = agreementsResult.rows;

    // Step 3: Check record count
    expect(agreementRows.length).toBe(stagingRows.length);

    // Step 4: Sort both by agreement_number to ensure 1-to-1 comparison
    const sortedStaging = stagingRows.sort((a, b) => String(a.agreement_number).localeCompare(String(b.agreement_number)));
    const sortedAgreements = agreementRows.sort((a, b) => String(a.agreement_number).localeCompare(String(b.agreement_number)));

    // Step 5: Compare all specified fields
    const mismatches = [];

    for (let i = 0; i < sortedStaging.length; i++) {
      const sa = sortedStaging[i];
      const a = sortedAgreements[i];

      const checks = [
        ['agreement_number', sa.agreement_number, a.agreement_number],
        ['fleet_agency_id', sa.fleet_agency_id, a.fleet_agency_id],
        ['brand_id', sa.brand_id, a.brand_id],
        ['rental_customer_type_id', sa.rental_customer_type_id, a.rental_customer_type_id],
        ['corporate_account', sa.corporate_account, a.corporate_account],
        ['checkout_datetime', formatDateTime(sa.checkout_datetime), formatDateTime(a.checkout_datetime)],
        ['checkout_location_id', sa.checkout_location_id, a.checkout_location_id],
        ['estimated_checkin_datetime', formatDateTime(sa.estimated_checkin_datetime), formatDateTime(a.estimated_checkin_datetime)],
        ['estimated_checkin_location_id', sa.estimated_checkin_location_id, a.estimated_checkin_location_id],
        ['checkin_datetime', formatDateTime(sa.checkin_datetime), formatDateTime(a.checkin_datetime)],
        ['checkin_location_id', sa.checkin_location_id, a.checkin_location_id],
        ['license_plate_number', sa.license_plate_number, a.license_plate_number],
        ['license_plate_state', sa.license_plate_state, a.license_plate_state],
        ['agreement_status_id', sa.agreement_status_id, a.record_status_id],
        ['swap_indicator', sa.swap_indicator, a.swap_indicator],
        ['swap_datetime', formatDateTime(sa.swap_datetime), formatDateTime(a.swap_datetime)],
      ];

      for (const [field, expected, actual] of checks) {
        if (String(expected) !== String(actual)) {
          mismatches.push({
            agreement_number: sa.agreement_number,
            field,
            expected,
            actual
          });
        }
      }
    }

    expect(mismatches.length).toBe(0);

  } catch (error) {
    logError(`Test failed for file "${filename}": ${error.message}`);
    throw error;
  }
});

test(`3353: should validate record count for agreements vs s_agreements for RA inserted for the first time as closed RA: ${filename}`, async () => {
  try {
    if (!filename) {
      throw new Error('TARGET_FILENAME_RA is not set in the environment variables.');
    }

    // Query 1: agreements
    const agreementsSql = readSQLFile('ra-management/sql/agreements-new-checkin.sql');
    const agreementsResult = await client.query(agreementsSql, [filename]);
    const agreementsRows = agreementsResult.rows;

    // Query 2: s_agreements
    const stagingSql = readSQLFile('ra-management/sql/s-agreements-new-checkin.sql');
    const stagingResult = await client.query(stagingSql, [filename]);
    const stagingRows = stagingResult.rows;

    // console.log(`Agreements rows: ${agreementsRows.length}`);
    // console.log(`Staging rows: ${stagingRows.length}`);

    // If both are empty → pass
    // if (agreementsRows.length === 0 && stagingRows.length === 0) {
    //   logSuccess(`No records found in either table for file "${filename}". Passing.`);
    //   return;
    // }

    // Compare counts
    expect(agreementsRows.length).toBe(stagingRows.length);
    //   logSuccess(`Record count matched for file "${filename}": ${agreementsRows.length}`);

  } catch (error) {
    logError(`Count test failed for file "${filename}": ${error.message}`);
    throw error;
  }
});

test(`3353: should validate column values for agreements vs s_agreements for RA inserted for the first time as closed RA: ${filename}`, async () => {
  try {
    if (!filename) {
      throw new Error('TARGET_FILENAME_RA is not set in the environment variables.');
    }

    // Query 1: agreements
    const agreementsSql = readSQLFile('ra-management/sql/agreements-new-checkin.sql');
    const agreementsResult = await client.query(agreementsSql, [filename]);
    const agreementsRows = agreementsResult.rows;

    // Query 2: s_agreements
    const stagingSql = readSQLFile('ra-management/sql/s-agreements-new-checkin.sql');
    const stagingResult = await client.query(stagingSql, [filename]);
    const stagingRows = stagingResult.rows;

    // If both are empty → pass
    // if (agreementsRows.length === 0 && stagingRows.length === 0) {
    //   logSuccess(`No records found in either table for file "${filename}". Skipping column validation.`);
    //   return;
    // }

    // Sort to ensure consistent comparison
    const sortedAgreements = agreementsRows.sort((a, b) => String(a.license_plate_number).localeCompare(String(b.license_plate_number)));
    const sortedStaging = stagingRows.sort((a, b) => String(a.license_plate_number).localeCompare(String(b.license_plate_number)));

    const mismatches = [];
    const fieldsToCompare = [
      'license_plate_number',
      'license_plate_state',
      'agreement_number',
      'fleet_agency_id',
      'brand_id',
      'rental_customer_type_id',
      'corporate_account',
      'checkout_location_id',
      'estimated_checkin_location_id',
      'checkin_location_id',
    ];

    for (let i = 0; i < sortedAgreements.length; i++) {
      const a = sortedAgreements[i];
      const sa = sortedStaging[i];

      for (const field of fieldsToCompare) {
        const expected = sa[field];
        const actual = a[field];

        if (String(expected) !== String(actual)) {
          mismatches.push({
            agreement_number: a.agreement_number,
            field,
            expected,
            actual
          });
        }
      }
    }

    // if (mismatches.length > 0) {
    //   logError(`Field mismatches found in file "${filename}":`);
    //   mismatches.forEach(m =>
    //     logError(
    //       `→ Agreement ${m.agreement_number} | Field '${m.field}' mismatch → Expected: ${m.expected}, Actual: ${m.actual}`
    //     )
    //   );
    // } else {
    //   logSuccess(`All field-level validations passed for file "${filename}".`);
    // }

    expect(mismatches.length).toBe(0);

  } catch (error) {
    logError(`Column validation test failed for file "${filename}": ${error.message}`);
    throw error;
  }
});
