// Required Modules
const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { Liquid } = require('liquidjs');
const path = require('path');
const { DateTime } = require('luxon');
const { parse } = require('csv-parse');   

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
    const paddedSeq = String(seq + 1).padStart(4, '0');
    return `AEA${paddedSeq}`;
}   

const offset = 18;

function generateAgreementNumber(seq) {
    return `RA-${String(generateLicensePlate(seq))}`;
}

function generateSequentialState(index) {
  const usStateAbbreviations = [ 'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  return usStateAbbreviations[index % usStateAbbreviations.length];
}

function generateAddress2(seq) {
    return `Block ${String(seq).padStart(7, '0')}`;
}

function generateCorporateNumber(seq) {
    return `CN-${String(generateLicensePlate(seq))}`;
}

// NEW: read CSV instead of DB
async function fetchFleetRowsFromCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(parse({
        delimiter: ',',   // your file is comma-delimited
        columns: false,   // no headers
        skip_empty_lines: true
      }))
      .on('data', (cols) => {
        const mappedRow = {
          brand: cols[0],
          license_plate_number: cols[2],
          license_plate_state: cols[3],
          make: cols[5],
          model: cols[6],
          location_group: cols[9],
          location_code: cols[10],
          location_name: cols[11],
          address_1: cols[12],
          address_2: cols[13],
          city: cols[14],
          state: cols[15],
          zip: cols[16]
        };
        rows.push(mappedRow);
      })
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}

function generateBAgreementData(numRecords, fleetRows = []) {
    const data = [];
    for (let i = 1; i <= numRecords; i++) {
        const now = DateTime.now();
        const threeDaysPastDate = now.minus({ days: 3 });
        const twoDaysPastDate = now.minus({ days: 2 });
        const yesterdayDate = now.minus({ days: 1 });
        const twentyDaysFutureDate = now.plus({ days: 20 });

        const fleetRow = (fleetRows && fleetRows.length > 0) ? fleetRows[(i - 1) % fleetRows.length] : null;

        const brand = fleetRow?.brand || rental_brand[Math.floor(Math.random() * rental_brand.length)];
        const license_plate_number = fleetRow?.license_plate_number || generateLicensePlate(i + offset);
        const license_plate_state = fleetRow?.license_plate_state || generateSequentialState(i + offset);

        const agreement_number = fleetRow?.license_plate_number ? `RA-${String(fleetRow.license_plate_number)}` : generateAgreementNumber(i + offset);

        const make = fleetRow?.make || faker.vehicle.manufacturer();
        const model = fleetRow?.model || faker.vehicle.model();
        const rental_customer_type_id = '1';
        const corporate_account = fleetRow?.license_plate_number ? `CN-${String(fleetRow.license_plate_number)}` : generateCorporateNumber(i + offset);

        let checkout_datetime = yesterdayDate.toFormat('yyyy-MM-dd 00:00:00');
        const estimated_checkin_datetime = twentyDaysFutureDate.toFormat('yyyy-MM-dd 00:00:00');

        if (i > numRecords - 2) {
            checkout_datetime = threeDaysPastDate.toFormat('yyyy-MM-dd 00:00:00');
        }

        const checkout_location_group_val = fleetRow?.location_group || generateLocationGroup(i + offset);
        const checkout_location_code_val = fleetRow?.location_code || location_code_list[Math.floor(Math.random() * location_code_list.length)];
        const checkout_location_name_val = fleetRow?.location_name || faker.location.city();
        const checkout_address_1_val = fleetRow?.address_1 || faker.location.streetAddress();
        const checkout_address_2_val = fleetRow?.address_2 || generateAddress2(i + offset);
        const checkout_city_val = fleetRow?.city || faker.location.city();
        const checkout_state_val = fleetRow?.state_code || generateSequentialState(i + offset);
        const checkout_zip_val = fleetRow?.zip ? String(fleetRow.zip).substring(0, 5) : faker.location.zipCode().substring(0, 5);
        
        let swapIndicator = false;
        let swapDatetime = '';
        if (i === numRecords) {
            swapIndicator = true;
            swapDatetime = twoDaysPastDate.toFormat('yyyy-MM-dd 00:00:00');
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

            swap_indicator: swapIndicator,
            swap_datetime: swapDatetime
        };

        if (i > numRecords - 2) {
            record.checkin_location_group = record.checkout_location_group;
            record.checkin_location_code = record.checkout_location_code;
            record.checkin_location_name = record.checkout_location_name;
            record.checkin_address_1 = record.checkout_address_1;
            record.checkin_address_2 = record.checkout_address_2;
            record.checkin_city = record.checkout_city;
            record.checkin_state = record.checkout_state;
            record.checkin_zip = record.checkout_zip;
            record.checkin_datetime = yesterdayDate.toFormat('yyyy-MM-dd 00:00:00');
        }

        data.push(record);
    }
    return { data };
}

async function generateAndWriteData() {
    let fleetRows = [];
    // Look for the most recent fleet CSV in the Fleetoutput directory with the
    // format em-fleet-MM-DD-YYYY-HH-MM.csv. If none found, fall back to
    // ../input-data/fleet-data.csv. If still none, proceed with synthetic data.
    let csvFilePath;
    const fleetOutputDir = path.join(__dirname, '../../fleet-management/Fleet_generation_automation_scrpit/Fleetoutput');
    try {
        if (fs.existsSync(fleetOutputDir) && fs.statSync(fleetOutputDir).isDirectory()) {
            const candidates = fs.readdirSync(fleetOutputDir).filter(f => /^em-fleet-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.csv$/i.test(f));
            if (candidates.length > 0) {
                // pick newest by mtime
                const withMtime = candidates.map(name => ({
                    name,
                    mtime: fs.statSync(path.join(fleetOutputDir, name)).mtime.getTime()
                }));
                withMtime.sort((a, b) => b.mtime - a.mtime);
                csvFilePath = path.join(fleetOutputDir, withMtime[0].name);
            }
        }

        // fallback to bundled sample CSV if nothing in Fleetoutput
        if (!csvFilePath) {
            const fallback = path.join(__dirname, '../input-data/fleet-data.csv');
            if (fs.existsSync(fallback)) {
                csvFilePath = fallback;
                console.log(`No fleet CSV in Fleetoutput; using fallback: ${fallback}`);
            }
        }

        if (csvFilePath) {
            fleetRows = await fetchFleetRowsFromCsv(csvFilePath);
            console.log(`Loaded ${fleetRows.length} rows from CSV file: ${csvFilePath}`);
        } else {
            console.warn('No fleet CSV found; proceeding with synthetic data.');
            fleetRows = [];
        }
    } catch (err) {
        console.warn('Error loading fleet CSV; proceeding with synthetic data.', err.message);
        fleetRows = [];
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

        fs.writeFileSync(outputCsvFilePath, output, 'utf-8');
        fs.writeFileSync(outputJsonFFilePath, JSON.stringify(b_agreement_data, null, 2), 'utf-8');

        const endTime = process.hrtime(startTime);
        console.log('Sample rental agreements data generated successfully.');
        console.log(`CSV File: ${outputCsvFilePath}`);
        console.log(`JSON File: ${outputJsonFFilePath}`);
        console.log('Time taken:', (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(2) + 'ms');
    } catch (err) {
        console.error('Error generating and writing data:', err);
    }
}

generateAndWriteData();