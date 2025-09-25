// Required Modules
const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { Liquid } = require('liquidjs');
const path = require('path');
const { DateTime } = require('luxon');
const { getDbClient, closeDbClient } = require('../../utils/dbClient');

const inputArg = parseInt(process.argv[2], 10);
if (isNaN(inputArg) || inputArg <= 0) {
    console.error('Please provide a valid number of records as an argument.');
    console.error('   Example: node script.js 50');
    process.exit(1);
}

const b_agreements_data_count = inputArg;
const location_code_list = ['ATL', 'LAX', 'ORD', 'DFW', 'DEN', 'JFK'];
const rental_brand = ["Enterprise", "National", "Alamo"];
const startTime = process.hrtime();

function generateLocationGroup(index) {
    const sequenceNumber = (index % 999999) + 1;
    return `GroupFR${String(sequenceNumber).padStart(6, '0')}`;
}
   
function generateLicensePlate(seq) {
    const paddedSeq = String(seq).padStart(4, '0');
    return `ADP${paddedSeq}`;
}   

function generateAgreementNumber(seq) {
        return `RA-${String(generateLicensePlate(seq))}`;
    }

function generateSequentialState(index) {
  const usStateAbbreviations = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 
  'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 
  'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ];
//   const canStateAbbreviations = [ 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK', 'NT', 'NU', 'YT' ];
  const allStateAbbreviations = [...usStateAbbreviations]; //, ...canStateAbbreviations];
  return allStateAbbreviations[index % allStateAbbreviations.length];
}

function generateAddress2(seq) {
    return `Block ${String(seq + 1).padStart(7, '0')}`;
}

function generateCorporateNumber(seq) {
    return `CN-${String(generateLicensePlate(seq))}`;
}

async function fetchFleetRows(limit) {
    const sqlFilePath = path.join(__dirname, 'sql', 'generate-agreements-records.sql');
    const rawSql = fs.readFileSync(sqlFilePath, 'utf-8');
    // Remove trailing semicolon if present
    const cleanedSql = rawSql.trim().replace(/;$/, '');
    const wrappedSql = `WITH q AS (${cleanedSql}) SELECT * FROM q LIMIT $1`;

    let client;
    try {
        client = await getDbClient();
    } catch (err) {
        console.error('Error creating DB client:', err && (err.stack || err.message || err));
        throw err;
    }

    try {
        const res = await client.query(wrappedSql, [limit]);
        return res.rows || [];
    } catch (err) {
        console.error('Error running fleet query:', err && (err.stack || err.message || err));
        throw err;
    }
}

function generateBAgreementData(numRecords, fleetRows = []) {
    const data = [];
    // const sampleErrorRecords = [];
    for (let i = 1; i <= numRecords; i++) {
        // console.log("am  here", i);
        // const isErrorRecord = i > numRecords - 7;
        const now = DateTime.now();
        const threeDaysPastDate = now.minus({ days: 3 });
        const twoDaysPastDate = now.minus({ days: 2 });
        const yesterdayDate = now.minus({ days: 1 });
        const twentyDaysFutureDate = now.plus({ days: 20 });

        // const agreement_number = isErrorRecord && i === numRecords ? null : generateAgreementNumber(i);
        // const brand = isErrorRecord && i === numRecords - 1 ? null :
        //               isErrorRecord && i === numRecords - 6 ? 'UNKNOWN_BRAND' :
        //               rental_brand[Math.floor(Math.random() * rental_brand.length)];
        // const license_plate_number = isErrorRecord && i === numRecords - 5 ? null :
        //                              isErrorRecord && i === numRecords - 4 ? 'ABC@123!' :
        //                              generateLicensePlate(i);
        // const license_plate_state = isErrorRecord && i === numRecords - 3 ? null :
        //                             isErrorRecord && i === numRecords - 2 ? 'CA$' :
        //                             generateSequentialState(i);
        // let checkout_datetime = yesterdayDate.toFormat('yyyy-MM-dd HH:mm:ss');
        // if (i === numRecords - 2) checkout_datetime = twentyDaysFutureDate.plus({ days: 1 }).toFormat('yyyy-MM-dd HH:mm:ss');
        // if (i === numRecords) checkout_datetime = null;

        // const estimated_checkin_datetime =
        //     (i === numRecords - 1) ? yesterdayDate.minus({ days: 2 }).toFormat('yyyy-MM-dd HH:mm:ss')
        //                           : twentyDaysFutureDate.toFormat('yyyy-MM-dd HH:mm:ss');

    // If we have fleetRows from the DB, use them (cycle through if fewer than numRecords)
    const fleetRow = (fleetRows && fleetRows.length > 0) ? fleetRows[(i - 1) % fleetRows.length] : null;

    const brand = fleetRow?.brand || rental_brand[Math.floor(Math.random() * rental_brand.length)];
    const license_plate_number = fleetRow?.license_plate_number || generateLicensePlate(i + 53);
    const license_plate_state = fleetRow?.license_plate_state || generateSequentialState(i + 53);

    // agreement_number should be RA-{license_plate_number} when license_plate_number is from DB
    const agreement_number = fleetRow?.license_plate_number ? `RA-${String(fleetRow.license_plate_number)}` : generateAgreementNumber(i + 53);

    const make = fleetRow?.make || faker.vehicle.manufacturer();
    const model = fleetRow?.model || faker.vehicle.model();
    const rental_customer_type_id = '1';
    // corporate_account should be C-{license_plate_number} when license_plate_number is from DB
    const corporate_account = fleetRow?.license_plate_number ? `CN-${String(fleetRow.license_plate_number)}` : generateCorporateNumber(i + 53);

    // default datetimes
    let checkout_datetime = yesterdayDate.toFormat('yyyy-MM-dd HH:mm:ss');
    const estimated_checkin_datetime = twentyDaysFutureDate.toFormat('yyyy-MM-dd HH:mm:ss');

    // For the last two records, checkout_datetime should be current_date - 3
    if (i > numRecords - 2) {
        checkout_datetime = threeDaysPastDate.toFormat('yyyy-MM-dd HH:mm:ss');
    }

    // compute checkout fields once (prefer DB values) and reuse for estimated_checkin
    const checkout_location_group_val = fleetRow?.location_group || `Group${generateLocationGroup(i+52)}`;
    const checkout_location_code_val = fleetRow?.location_code || location_code_list[Math.floor(Math.random() * location_code_list.length)];
    const checkout_location_name_val = fleetRow?.location_name || faker.location.city();
    const checkout_address_1_val = fleetRow?.address_1 || faker.location.streetAddress();
    const checkout_address_2_val = fleetRow?.address_2 || generateAddress2(i+52);
    const checkout_city_val = fleetRow?.city || faker.location.city();
    const checkout_state_val = fleetRow?.state_code || generateSequentialState(i+53);
    const checkout_zip_val = fleetRow?.zip ? String(fleetRow.zip).substring(0, 5) : faker.location.zipCode().substring(0, 5);
        
        // Do not generate random swap datetimes for every record. Only the final record should have swap info.
        let swapIndicator = false;
        let swapDatetime = null;

        // For the last record only, set swap_indicator true and swap_datetime = current_date - 2
        if (i === numRecords) {
            swapIndicator = true;
            swapDatetime = twoDaysPastDate.toFormat('yyyy-MM-dd HH:mm:ss');
        }

        const record = {
            agreement_number,
            brand,
            license_plate_number,
            license_plate_state,
            make,
            model,
            rental_customer_type_id,
            corporate_account,
            checkout_location_group: checkout_location_group_val,
            checkout_location_code: checkout_location_code_val,
            checkout_location_name: checkout_location_name_val,
            checkout_address_1: checkout_address_1_val,
            checkout_address_2: checkout_address_2_val,
            checkout_city: checkout_city_val,
            checkout_state: checkout_state_val,
            checkout_zip: checkout_zip_val,
            checkout_datetime,
            estimated_checkin_location_group: checkout_location_group_val,
            estimated_checkin_location_code: checkout_location_code_val,
            estimated_checkin_location_name: checkout_location_name_val,
            estimated_checkin_address_1: checkout_address_1_val,
            estimated_checkin_address_2: checkout_address_2_val,
            estimated_checkin_city: checkout_city_val,
            estimated_checkin_state: checkout_state_val,
            estimated_checkin_zip: checkout_zip_val,
            estimated_checkin_datetime,

            checkin_location_group: '',
            checkin_location_code: '',
            checkin_location_name: '',
            checkin_address_1: '',
            checkin_address_2: '',
            checkin_city: '',
            checkin_state: '',
            checkin_zip: '',
            checkin_datetime: '',
            
            // checkin_location_group: estimated_checkin_location_group,
            // checkin_location_code: estimated_checkin_location_code,
            // checkin_location_name: estimated_checkin_location_name,
            // checkin_address_1: estimated_checkin_address_1,
            // checkin_address_2: estimated_checkin_address_2,
            // checkin_city: estimated_checkin_city,
            // checkin_state: estimated_checkin_state,
            // checkin_zip: estimated_checkin_zip,
            // checkin_datetime: estimated_checkin_datetime,

            swap_indicator: swapIndicator,
            swap_datetime: swapDatetime
        };

        // For the last two records, copy checkout info into checkin and set checkin_datetime = current_date - 1
        if (i > numRecords - 2) {
            record.checkin_location_group = record.checkout_location_group;
            record.checkin_location_code = record.checkout_location_code;
            record.checkin_location_name = record.checkout_location_name;
            record.checkin_address_1 = record.checkout_address_1;
            record.checkin_address_2 = record.checkout_address_2;
            record.checkin_city = record.checkout_city;
            record.checkin_state = record.checkout_state;
            record.checkin_zip = record.checkout_zip;
            record.checkin_datetime = yesterdayDate.toFormat('yyyy-MM-dd HH:mm:ss');
        }

        data.push(record);

    }

    // console.log(`Generated ${data} b_agreements records.`);

    // return { data, sampleErrorRecords };
    return { data };
}

async function generateAndWriteData() {
    // console.log(`Generating ${b_agreements_data_count} b_agreements records...`);
    // Fetch fleet rows from DB to seed fields
    let fleetRows = [];
    try {
        fleetRows = await fetchFleetRows(b_agreements_data_count);
    } catch (err) {
        console.warn('Proceeding without DB rows due to error. Falling back to synthetic data.');
    }

    const { data: b_agreement_data } = generateBAgreementData(b_agreements_data_count, fleetRows);
    const filenameTimestamp = DateTime.now().toFormat('MM-dd-yyyy-HH-mm');
    const templateFilePath = path.join(__dirname, '../sample-ra-generation/b-agreements-pipe-template.txt');
    const outputCsvFilePath = path.join(__dirname, `../sample-ra-generation/em-ra-${filenameTimestamp}.csv`);
    const outputJsonFFilePath = path.join(__dirname, `../sample-ra-generation/generated-valid-records.json`);

    try {
        const liquidTemplate = fs.readFileSync(templateFilePath, 'utf-8');
        const engine = new Liquid({ greedy: true });
        const output = await engine.parseAndRenderSync(liquidTemplate, {
            b_agreement_data,
            num_b_agreement_data: b_agreement_data.length
        });

        // Write CSV file
        fs.writeFileSync(outputCsvFilePath, output, 'utf-8');

        // Write Json file
        fs.writeFileSync(outputJsonFFilePath, JSON.stringify(b_agreement_data, null, 2), 'utf-8');

        // fs.writeFileSync(
        //     path.join(__dirname, '../sample-ra-generation/generated-invalid-records.json'),
        //     JSON.stringify(sampleErrorRecords, null, 2)
        // );

        const endTime = process.hrtime(startTime);
        console.log('Sample rental agreements data generated successfully.');
        console.log(`CSV File: ${outputCsvFilePath}`);
        console.log(`JSON File: ${outputJsonFFilePath}`);
        console.log('Time taken:', (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2) + 'ms');
    } catch (err) {
        console.error('Error generating and writing data:', err);
    } finally {
        // ensure DB client is closed when finished
        try {
            await closeDbClient();
        } catch (e) {
            // ignore
        }
    }
}

generateAndWriteData();

// async function generateAndWriteData() {
//     const { data: b_agreement_data, sampleErrorRecords } = generateBAgreementData(b_agreements_data_count);
//     const filenameTimestamp = DateTime.now().toFormat('MM-dd-yyyy-HH-mm');
//     const templateFilePath = path.join(__dirname, '../sample-ra-generation/b-agreements-pipe-template.txt');
//     const outputFilePath = path.join(__dirname, `../sample-ra-generation/em-ra-${filenameTimestamp}.csv`);
//     const errorRecordsFolder = path.join(__dirname, '../sample-ra-generation/error-records');

//     try {
//         // Ensure error-records folder exists
//         if (!fs.existsSync(errorRecordsFolder)) {
//             fs.mkdirSync(errorRecordsFolder, { recursive: true });
//         }

//         // Load and render Liquid template
//         const liquidTemplate = fs.readFileSync(templateFilePath, 'utf-8');
//         const engine = new Liquid({ greedy: true });
//         const output = await engine.parseAndRenderSync(liquidTemplate, {
//             b_agreement_data,
//             num_b_agreement_data: b_agreement_data.length
//         });

//         // Write main CSV
//         fs.writeFileSync(outputFilePath, output, 'utf-8');

//         // Write all error records into a single JSON
//         fs.writeFileSync(
//             path.join(__dirname, '../sample-ra-generation/generated-invalid-records.json'),
//             JSON.stringify(sampleErrorRecords, null, 2)
//         );

//         // Helper to identify and describe error in each record
//         function getErrorDescription(record) {
//             if (!record.agreement_number) return 'missing_agreement_number';
//             if (!record.brand) return 'missing_brand';
//             if (record.brand === 'UNKNOWN_BRAND') return 'invalid_brand';
//             if (!record.license_plate_number) return 'missing_license_plate';
//             if (record.license_plate_number.includes('@')) return 'invalid_license_plate_format';
//             if (!record.license_plate_state) return 'missing_license_plate_state';
//             if (record.license_plate_state.includes('$')) return 'invalid_license_plate_state';
//             if (!record.checkout_datetime) return 'missing_checkout_datetime';
//             if (record.checkout_datetime && DateTime.fromFormat(record.checkout_datetime, 'yyyy-MM-dd HH:mm:ss') > DateTime.now().plus({ days: 20 })) return 'checkout_date_future';
//             if (record.estimated_checkin_datetime && DateTime.fromFormat(record.estimated_checkin_datetime, 'yyyy-MM-dd HH:mm:ss') < DateTime.now()) return 'estimated_checkin_date_in_past';
//             return 'unknown_error';
//         }

//         // Write each error record to its own descriptive JSON file
//         sampleErrorRecords.forEach((record, idx) => {
//             const errorDesc = getErrorDescription(record);
//             const sanitizedErrorDesc = errorDesc.replace(/[^a-zA-Z0-9_-]/g, '_');
//             const errorFilePath = path.join(errorRecordsFolder, `error-${idx + 1}-${sanitizedErrorDesc}.json`);
//             fs.writeFileSync(errorFilePath, JSON.stringify(record, null, 2));
//         });

//         const endTime = process.hrtime(startTime);
//         console.log('Sample rental agreements data generated successfully.');
//         console.log('Individual error records saved to:', errorRecordsFolder);
//         console.log('Time taken:', (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2) + 'ms');
//     } catch (err) {
//         console.error('Error generating and writing data:', err);
//     }
// }
// generateAndWriteData();