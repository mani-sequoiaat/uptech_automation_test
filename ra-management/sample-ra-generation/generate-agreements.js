// Required Modules
const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { Liquid } = require('liquidjs');
const path = require('path');
const { DateTime } = require('luxon');

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

// function getWeekCode(weekNumber) {
//     return weekNumber <= 26 ? String.fromCharCode(64 + weekNumber) : String.fromCharCode(96 + (weekNumber - 26));
// }

    function getDayCode(dayNumber) {
        return ['U', 'M', 'T', 'W', 'H', 'F', 'S'][dayNumber];
    }

   
function generateLicensePlate(seq) {
    const now = DateTime.now();
    const dayCode = getDayCode(now.weekday % 7); // Luxon: Monday = 1 ... Sunday = 7
    const paddedSeq = String(seq).padStart(4, '0');
    return `ADP${paddedSeq}`;
}   

function generateAgreementNumber(seq) {
        const now = DateTime.now();
        const dayCode = getDayCode(now.weekday % 7); // Luxon: Monday = 1 ... Sunday = 7
        const paddedSeq = String(seq).padStart(4, '0');
        return `RA-${String(generateLicensePlate(seq))}`;
    }

function generateSequentialState(index) {
  const usStateAbbreviations = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 
  'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 
  'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 
  'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'PR' ];
  const canStateAbbreviations = [ 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK', 'NT', 'NU', 'YT' ];
  const allStateAbbreviations = [...usStateAbbreviations, ...canStateAbbreviations];
  return allStateAbbreviations[index % allStateAbbreviations.length];
}

function generateAddress2(seq) {
    return `Block ${String(seq + 1).padStart(7, '0')}`;
}

function generateCorporateNumber(seq) {
    const now = DateTime.now();
    const dayCode = getDayCode(now.weekday % 7); // Luxon: Monday = 1 ... Sunday = 7
    const paddedSeq = String(seq).padStart(4, '0');
    return `CN-${String(generateLicensePlate(seq))}`;
}

// function getRandomDateTimeBetween(start, end) {
//     const randomMillis = Math.floor(Math.random() * (end.toMillis() - start.toMillis() - 1)) + start.toMillis() + 1;
//     return DateTime.fromMillis(randomMillis);
// }

function generateBAgreementData(numRecords) {
    const data = [];
    // const sampleErrorRecords = [];
    for (let i = 1; i <= numRecords; i++) {
        // console.log("am  here", i);
        // const isErrorRecord = i > numRecords - 7;
        const now = DateTime.now();
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

        const agreement_number = generateAgreementNumber(i+53);
        const brand = rental_brand[Math.floor(Math.random() * rental_brand.length)];
        const license_plate_number = generateLicensePlate(i+53);
        const license_plate_state = generateSequentialState(i+53);

        const make = faker.vehicle.manufacturer();
        const model = faker.vehicle.model();
        const rental_customer_type_id = '1';
        const corporate_account = generateCorporateNumber(i+53);

        const checkout_datetime = yesterdayDate.toFormat('yyyy-MM-dd HH:mm:ss');
        const estimated_checkin_datetime = twentyDaysFutureDate.toFormat('yyyy-MM-dd HH:mm:ss');
        
        const swapIndicator = Math.random() >= 0.5;
        const swapDatetime = swapIndicator 
            ? now.toFormat('yyyy-MM-dd HH:mm:ss') 
            : null;

        const record = {
            agreement_number,
            brand,
            license_plate_number,
            license_plate_state,
            make,
            model,
            rental_customer_type_id,
            corporate_account,
            checkout_location_group: `Group${generateLocationGroup(i+52)}`,
            checkout_location_code: location_code_list[Math.floor(Math.random() * location_code_list.length)],
            checkout_location_name: faker.location.city(),
            checkout_address_1: faker.location.streetAddress(),
            checkout_address_2: generateAddress2(i+52),
            checkout_city: faker.location.city(),
            checkout_state: generateSequentialState(i+53),
            checkout_zip: faker.location.zipCode().substring(0, 5),
            checkout_datetime,
            estimated_checkin_location_group: `Group${generateLocationGroup(i+52)}`,
            estimated_checkin_location_code: location_code_list[Math.floor(Math.random() * location_code_list.length)],
            estimated_checkin_location_name: faker.location.city(),
            estimated_checkin_address_1: faker.location.streetAddress(),
            estimated_checkin_address_2: generateAddress2(i+52),
            estimated_checkin_city: faker.location.city(),
            estimated_checkin_state: generateSequentialState(i+53),
            estimated_checkin_zip: faker.location.zipCode().substring(0, 5),
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

        // if (isErrorRecord) {
        //     sampleErrorRecords.push(record);
        // }

        data.push(record);

    }

    // console.log(`Generated ${data} b_agreements records.`);

    // return { data, sampleErrorRecords };
    return { data };
}

async function generateAndWriteData() {
    // console.log(`Generating ${b_agreements_data_count} b_agreements records...`);
    // const { data: b_agreement_data, sampleErrorRecords } = generateBAgreementData(b_agreements_data_count);
    const { data: b_agreement_data } = generateBAgreementData(b_agreements_data_count);
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