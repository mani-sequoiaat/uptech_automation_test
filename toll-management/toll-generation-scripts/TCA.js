const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs'); // <-- ADDED DAYJS
const { getDbClient, closeDbClient } = require('../../utils/dbClient');
const outputDir = path.join(__dirname, '../generated-toll-files/tca');
const sqlFilePath = path.join(__dirname, '../SQL/Active_fleet_RA.sql');

let sqlQuery;
try {
  sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
} catch (err) {
  console.error(`Failed to read SQL file at ${sqlFilePath}:`, err);
  process.exit(1);
}

/**
 * Fetches license plate and agreement data from the database.
 * @param {object} client - The connected 'pg' client object.
 * @returns {Promise<Array<object>>}
 */
async function fetchAgreementData(client) {
    try {
        console.log('Fetching records from database using external SQL file...');
        const res = await client.query(sqlQuery);
        console.log(`Fetched ${res.rows.length} records.`);
        
        // --- UPDATED: Map all required fields ---
        const agreementData = res.rows.map(row => ({
            plate: row.license_plate_number,
            state: row.license_plate_state,
            checkout_datetime: row.checkout_datetime, // <-- Required for date logic
            estimated_checkin_datetime: row.estimated_checkin_datetime // <-- Required for date logic
        }));
        
        return agreementData;
    } catch (err) {
        console.error('Database query error:', err.stack);
        throw err;
    }
}


// --- Helper Functions (as per ICD) ---

function padRight(str, length) {
    return String(str).padEnd(length, ' ');
}

function padLeft(str, length, char = '0') {
    return String(str).padStart(length, char);
}

function getMMDDYYYY(date) { // Accepts a JS Date object
    const mm = padLeft(date.getMonth() + 1, 2);
    const dd = padLeft(date.getDate(), 2);
    const yyyy = date.getFullYear();
    return `${mm}${dd}${yyyy}`;
}

function getHHMMSS(date) { // Accepts a JS Date object
    const hh = padLeft(date.getHours(), 2);
    const mm = padLeft(date.getMinutes(), 2);
    const ss = padLeft(date.getSeconds(), 2);
    return `${hh}${mm}${ss}`;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- NEW: Helper function for random date generation ---
/**
 * Generates a random dayjs object between two dayjs objects.
 * @param {dayjs.Dayjs} start - The minimum date (inclusive).
 * @param {dayjs.Dayjs} end - The maximum date (inclusive).
 * @returns {dayjs.Dayjs} A random dayjs object.
 */
function getRandomDateBetween(start, end) {
    const startTimestamp = start.valueOf();
    const endTimestamp = end.valueOf();
    const randomTimestamp = getRandomInt(startTimestamp, endTimestamp);
    return dayjs(randomTimestamp);
}

// Sample toll locations from the ICD Appendix
const tollLocations = [
    { location: 'Bay Bridge-Lane 1', road: 'Bay Bridge' },
    { location: 'San Mateo-Lane 3', road: 'San Mateo Bridge' },
    // ... (rest of your locations)
    { location: '110NB Rosecrans To Slauson', road: '110 Harbor ExpressLanes' },
    { location: 'Miramar Way NB', road: 'I-15 Express Lanes' }
];


// --- Record Generation Functions (as per ICD) ---

function createHeader(fileName, transmissionDate) {
    let header = '';
    header += padRight('H1', 2); // Fld 1: Record Indicator
    header += padRight('TC', 2); // Fld 2: Company Code (Sender)
    header += padRight('The Toll Roads', 20); // Fld 3: Company Name (Sender)
    header += padRight('UE', 2); // Fld 4: Company Code (Receiver)
    header += padRight('uptech', 20); // Fld 5: Company Name (Receiver)
    header += padRight(fileName, 30); // Fld 6: File Name
    header += padRight(transmissionDate, 8); // Fld 7: Transmission Date
    return header;
}

/**
 * Creates a Detail Record string for a single toll transaction.
 * @param {object} agreementData - The full agreement object from the DB.
 * @returns {string|null} The formatted Detail record, or null if logic fails.
 */
function createDetailRecord(agreementData) {
    // --- NEW DATE LOGIC ---
    const checkoutDate = dayjs(agreementData.checkout_datetime);
    const estimatedCheckinDate = dayjs(agreementData.estimated_checkin_datetime);
    const today = dayjs();

    // Start date for toll must be *after* checkout
    const minDate = checkoutDate; 
    
    // End date must be *before* estimated check-in OR *before* today,
    // whichever is earlier.
    const maxDate = estimatedCheckinDate.isBefore(today) ? estimatedCheckinDate : today;

    // Check for an invalid date range
    // (e.g., checkout date is in the future, or after the max valid date)
    if (minDate.isAfter(maxDate)) {
      console.warn(`Skipping plate ${agreementData.plate}: No valid date range found. (Checkout: ${checkoutDate.format()}, MaxValid: ${maxDate.format()})`);
      return null; // Signal to skip this record
    }

    // Generate random toll date and time within the valid range
    const randomTollDateTime = getRandomDateBetween(minDate, maxDate);
    const tollDate = getMMDDYYYY(randomTollDateTime.toDate());
    const tollTime = getHHMMSS(randomTollDateTime.toDate());
    // --- END NEW DATE LOGIC ---

    const randomToll = tollLocations[getRandomInt(0, tollLocations.length - 1)];
    const tollAmount = padLeft(getRandomInt(50, 1500), 6); // $0.50 to $15.00

    let detail = '';
    detail += padRight('D1', 2); // Fld 1: Record Indicator
    detail += padRight(agreementData.state, 2); // Fld 2: State
    detail += padRight(agreementData.plate, 10); // Fld 3: Plate
    detail += padRight('', 20); // Fld 4: Transponder Number (Optional)
    detail += padRight(tollDate, 8); // Fld 5: Toll Date
    detail += padRight(tollTime, 6); // Fld 6: Toll Time
    detail += padLeft(tollAmount, 6, '0'); // Fld 7: Toll Amount
    detail += padRight(randomToll.location, 30); // Fld 8: Toll Location
    detail += padRight(randomToll.road, 50); // Fld 9: Road Name
    detail += padLeft('2', 2, '0'); // Fld 10: Axle Count (Defaults to 2)
    return detail;
}

function createTrailer(fileName, transmissionDate, recordCount) {
    let trailer = '';
    trailer += padRight('T1', 2); // Fld 1: Record Indicator
    trailer += padRight(fileName, 30); // Fld 2: File Name
    trailer += padRight(transmissionDate, 8); // Fld 3: Transmission Date
    trailer += padLeft(recordCount, 8, '0'); // Fld 4: Number of Records
    return trailer;
}

/**
 * Generates the .tol file using data from the database.
 * @param {Array<object>} agreementDataList - Array of agreement objects.
 * @param {number} requestedCount - The number of records to generate.
 */
function generateTollFile(agreementDataList, requestedCount) {
    if (!agreementDataList || agreementDataList.length === 0) {
        console.log('No agreement data found. Aborting file generation.');
        return;
    }

    // --- UPDATED: Check available records vs. requested count ---
    if (agreementDataList.length < requestedCount) {
        console.warn(`Warning: Requested ${requestedCount} records, but only ${agreementDataList.length} eligible agreements found.`);
        // We *don't* change the requestedCount, as the loop below will handle it.
    }

    const now = new Date();
    const transmissionDate = getMMDDYYYY(now);
    const transmissionTime = getHHMMSS(now);
    const fileName = `tcue_${transmissionDate}_${transmissionTime}.tol`;

    const fileContent = [];

    // 1. Create Header
    const header = createHeader(fileName, transmissionDate);
    fileContent.push(header);

    // --- NEW LOOP LOGIC (like your BATA script) ---
    // This smart loop generates the requested number of *valid* records.
    let recordsGenerated = 0;
    let agreementIndex = 0;
    const detailRecords = [];

    while (recordsGenerated < requestedCount && agreementIndex < agreementDataList.length) {
        const agreement = agreementDataList[agreementIndex];
        agreementIndex++; // Move to next agreement

        const detailRecord = createDetailRecord(agreement);
        
        if (detailRecord) {
            detailRecords.push(detailRecord);
            recordsGenerated++;
        }
        // If detailRecord is null, loop continues to try the next agreement
    }
    
    // After loop, check if we still didn't get enough records
    if (recordsGenerated < requestedCount) {
         console.warn(`Warning: Could only generate ${recordsGenerated} valid records out of ${requestedCount} requested.`);
         console.warn(`This may be due to invalid checkout/check-in date ranges.`);
    }
    // --- END NEW LOOP LOGIC ---

    // 2. Add all valid detail records
    fileContent.push(...detailRecords);

    // 3. Create Trailer (use the *actual* number of records generated)
    const trailer = createTrailer(fileName, transmissionDate, recordsGenerated);
    fileContent.push(trailer);

    // Join all lines with a newline character
    const fileString = fileContent.join('\n');

    // Create directory and full output path
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, fileName);

        // 4. Write to file
        fs.writeFile(outputPath, fileString, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log(`Successfully generated file: ${outputPath}`);
                // Log the *actual* count
                console.log(`Total detail records written: ${recordsGenerated}`);
            }
        });
    } catch (err) {
        console.error(`Failed to create output directory or write file:`, err);
    }
}

// --- Main execution ---
async function main() {
    // Get count from command line
    const countArg = process.argv[2];
    const requestedCount = parseInt(countArg, 10);

    if (isNaN(requestedCount) || requestedCount <= 0) {
        console.error('Error: Please provide a valid number as a command-line argument.');
        console.log('Usage: node TCA.js 10');
        process.exit(1);
    }
    console.log(`Requested to generate ${requestedCount} toll records.`);

    let client;
    try {
        // 1. Get the shared client from your module
        console.log('Acquiring database client...');
        client = await getDbClient();
        console.log('Database client acquired.');

        // 2. Fetch data
        const agreementData = await fetchAgreementData(client);

        // 3. Generate file (pass the requested count)
        generateTollFile(agreementData, requestedCount);

    } catch (err) {
        console.error('An error occurred during the file generation process:', err);
    } finally {
        // 4. Always close the connection
        if (client) {
            await closeDbClient();
            console.log('Database connection closed.');
        }
    }
}

// Run the main function
main();