const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { getDbClient, closeDbClient } = require('../../utils/dbClient');
const outputDir = path.join(__dirname, '../generated-toll-files/tca');
const sqlFilePath = path.join(__dirname, '../SQL/Active_fleet_RA.sql');

let sqlQuery;
try {
  sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
} catch (err) {
  console.error(`Failed to read SQL file at ${sqlFilePath}:`, err);
  process.exit(1); // Exit if the query file can't be read
}

/**
 * Fetches license plate data using the provided database client.
 * @param {object} client - The connected 'pg' client object.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of { plate, state }.
 */
async function fetchLicensePlates(client) {
    try {
        console.log('Fetching records from database using external SQL file...');
        const res = await client.query(sqlQuery);
        console.log(`Fetched ${res.rows.length} records.`);
        
        // Map the results to the simple { plate, state } format
        const licensePlates = res.rows.map(row => ({
            plate: row.license_plate_number,
            state: row.license_plate_state
        }));
        
        return licensePlates;
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

function getMMDDYYYY(date) {
    const mm = padLeft(date.getMonth() + 1, 2);
    const dd = padLeft(date.getDate(), 2);
    const yyyy = date.getFullYear();
    return `${mm}${dd}${yyyy}`;
}

function getHHMMSS(date) {
    const hh = padLeft(date.getHours(), 2);
    const mm = padLeft(date.getMinutes(), 2);
    const ss = padLeft(date.getSeconds(), 2);
    return `${hh}${mm}${ss}`;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Sample toll locations from the ICD Appendix
const tollLocations = [
    { location: 'Bay Bridge-Lane 1', road: 'Bay Bridge' },
    { location: 'San Mateo-Lane 3', road: 'San Mateo Bridge' },
    { location: 'Dumbarton-Lane 1', road: 'Dumbarton Bridge' },
    { location: 'Carquinez-Lane 8', road: 'Carquinez Bridge' },
    { location: 'Catalina View South-Lane 10', road: 'The Toll Roads' },
    { location: 'Oso Bridge Mainline NB Lane 11', road: 'The Toll Roads' },
    { location: 'GG Bridge - Lane 5', road: 'Golden Gate Bridge' },
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

function createDetailRecord(lpnData) {
    const randomToll = tollLocations[getRandomInt(0, tollLocations.length - 1)];
    const tollAmount = padLeft(getRandomInt(50, 1500), 6); // $0.50 to $15.00
    const tollDate = getMMDDYYYY(new Date(Date.now() - getRandomInt(0, 86400000)));
    const tollTime = getHHMMSS(new Date(Date.now() - getRandomInt(0, 3600000)));

    let detail = '';
    detail += padRight('D1', 2); // Fld 1: Record Indicator
    detail += padRight(lpnData.state, 2); // Fld 2: State
    detail += padRight(lpnData.plate, 10); // Fld 3: Plate
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
 * @param {Array<object>} licensePlates - Array of { plate, state } objects.
 * @param {number} requestedCount - The number of records to generate.
 */
function generateTollFile(licensePlates, requestedCount) {
    if (!licensePlates || licensePlates.length === 0) {
        console.log('No license plates found. Aborting file generation.');
        return;
    }

    // Check if requested count exceeds available plates
    let actualRecordCount = requestedCount;
    if (licensePlates.length < requestedCount) {
        console.warn(`Warning: Requested ${requestedCount} records, but only ${licensePlates.length} eligible plates found.`);
        console.warn(`Generating ${licensePlates.length} records instead.`);
        actualRecordCount = licensePlates.length;
    }

    const now = new Date();
    const transmissionDate = getMMDDYYYY(now);
    const transmissionTime = getHHMMSS(now);
    const fileName = `tcue_${transmissionDate}_${transmissionTime}.tol`;

    const fileContent = [];

    // 1. Create Header
    const header = createHeader(fileName, transmissionDate);
    fileContent.push(header);

    // 2. Create Detail Records
    for (let i = 0; i < actualRecordCount; i++) {
        const lpn = licensePlates[i]; 
        const detailRecord = createDetailRecord(lpn);
        fileContent.push(detailRecord);
    }

    // 3. Create Trailer
    const trailer = createTrailer(fileName, transmissionDate, actualRecordCount);
    fileContent.push(trailer);

    // Join all lines with a newline character
    const fileString = fileContent.join('\n');

    // --- NEW: Create directory and full output path ---
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
                console.log(`Successfully generated file: ${outputPath}`); // <-- Updated log
                console.log(`Total detail records written: ${actualRecordCount}`);
            }
        });
    } catch (err) {
        console.error(`Failed to create output directory or write file:`, err);
    }
    // --- END NEW ---
}

// --- Main execution ---
async function main() {
    // Get count from command line
    const countArg = process.argv[2];
    const requestedCount = parseInt(countArg, 10);

    if (isNaN(requestedCount) || requestedCount <= 0) {
        console.error('Error: Please provide a valid number as a command-line argument.');
        console.log('Usage: node generateTollFile.js 10');
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
        const plates = await fetchLicensePlates(client);

        // 3. Generate file (pass the requested count)
        generateTollFile(plates, requestedCount);

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