const fs = require('fs');
const readline = require('readline');
const { Liquid } = require('liquidjs');
const path = require('path');
const { DateTime } = require('luxon');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (process.argv.length < 3) {
    console.error("Usage: node script.js <number_of_records>");
    console.error("Example: node script.js 300");
    process.exit(1);
}

const bTollsNttaDataCount = parseInt(process.argv[2]);
// const daysOfInsertion = parseInt(process.argv[3]);

const startTime = process.hrtime();
const now = DateTime.now();
const yesterday = now.minus({ days: 1 });

// const dayPrefixes = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
// const dayPrefixes = ['FRI'];


function generateTransactionLocation() {
    const nttaTollFacilities = [
        '360T', 'AATT', 'CTP', 'DNT', 'LLTB', 'MCLB', 'PGBT', 'SRT'
    ];
    const randomFacility = nttaTollFacilities[Math.floor(Math.random() * nttaTollFacilities.length)];

    const plaza = ['PlazaA', 'PlazaB', 'PlazaC'];
    const randomPlaza = plaza[Math.floor(Math.random() * plaza.length)];

    const laneNumber = ['1', '2', '3', '4', '5'];
    const randomLane = laneNumber[Math.floor(Math.random() * laneNumber.length)];

    return `${randomFacility}-${randomPlaza}-${randomLane}`;
}

function generateRandomState() {
    const usStateAbbreviations = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'PR' ];
    const canStateAbbreviations = [ 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK', 'NT', 'NU', 'YT' ];
    const allStateAbbreviations = [...usStateAbbreviations, ...canStateAbbreviations];
    return allStateAbbreviations[Math.floor(Math.random() * allStateAbbreviations.length)];
}

function getWeekCode(weekNumber) {
    if (weekNumber >= 1 && weekNumber <= 26) {
        return String.fromCharCode(64 + weekNumber);  // A-Z (65–90)
    } else if (weekNumber >= 27 && weekNumber <= 52) {
        return String.fromCharCode(96 + (weekNumber - 26));  // a–z (97–122)
    } else {
        throw new Error('Invalid week number');
    }
}

function getDayCode(dayNumber) {
    const dayMap = ['U', 'M', 'T', 'W', 'H', 'F', 'S'];  // Sunday=0
    return dayMap[dayNumber];
}

function generateLicensePlate(sequenceNumber) {
    const now = DateTime.now();
    const year = now.toFormat('yy');
    const weekNumber = now.weekNumber;
    const weekday = now.weekday % 7; // Luxon: Monday=1..Sunday=7, we need 0–6
    const weekCode = getWeekCode(weekNumber);
    const dayCode = getDayCode(weekday);
    const paddedSeq = String(sequenceNumber).padStart(7, '0');
    return `${year}${weekCode}${dayCode}-${paddedSeq}`;
}

function generateRecordNumber(index) {
    return `${String(index + 1).padStart(7, '0')}`
}

function generateVarianceID(index) {
    const datePart = yesterday.toFormat('yyyyLLdd');
    const multipliedDate = (parseInt(datePart) * 2).toString();
    return `${multipliedDate}${String(index + 1).padStart(6, '0')}`;
}

function generateTollRate() {
    const rates = ['300', '350', '400', '450', '500', '550', '600', '650', '700'];
    return rates[Math.floor(Math.random() * rates.length)];
}

function generateVideoPremium() {
    const rates = ['200','250'];
    return rates[Math.floor(Math.random() * rates.length)];
}

function generateTransactionFee() {
    const rates = ['100','150'];
    return rates[Math.floor(Math.random() * rates.length)];
}

function generatetransactionAmount() {
    transactionRate = Number(generateTollRate()) + Number(generateVideoPremium()) + Number(generateTransactionFee());
    transactionRateAsString = transactionRate.toString();
    return transactionRateAsString;
}

function generateBTollsNttaData(bTollsNttaDataCount) {
    const data = [];
    const plateStateMap = new Map();
    const transactionDateTimeCT = DateTime.now().minus({ days : 1 }).setZone('America/Chicago');
    // const transactionDateTimeUTC = DateTime.utc().minus({ days: 2 });

    for (let i = 0; i < bTollsNttaDataCount; i++) {
        const recordCode = 'REQDT'
        const recordNumber = generateRecordNumber(i);
        const varianceID = generateVarianceID(i);
        const licensePlateNumber = generateLicensePlate(i);

        if (!plateStateMap.has(licensePlateNumber)) {
            plateStateMap.set(licensePlateNumber, generateRandomState());
        }

        const licensePlateState = plateStateMap.get(licensePlateNumber);
        const transactionDateTime = transactionDateTimeCT.toFormat('yyyyMMddHHmmss');
        const tollAmount = generateTollRate();
        const video_premium = generateVideoPremium();
        const transactionFee = generateTransactionFee();
        const transactionAmount = generatetransactionAmount();
        const transactionLocation = generateTransactionLocation();

        data.push({ 
            record_code: recordCode,
            record_number: recordNumber,
            variance_id: varianceID, 
            license_plate_number: licensePlateNumber, 
            license_plate_state: licensePlateState, 
            transaction_datetime: transactionDateTime, 
            toll_amount: tollAmount,
            video_premium: video_premium,
            transaction_fee: transactionFee,
            transaction_amount: transactionAmount,
            transaction_location: transactionLocation
         });
    }
    return data;
}

async function generateAndWriteData() {
    rl.close();

    const b_tolls_ntta_data = generateBTollsNttaData(bTollsNttaDataCount);
    const templateFilePath = path.join(__dirname, '../liquidjs-b-tolls-ntta/b-tolls-ntta-pipe-template.txt');
    const filenameTimestamp = DateTime.now().toFormat('yyyyMMddHHmmss');
    const outputFilePath = path.join(__dirname, `../liquidjs-b-tolls-ntta/UTS_VC_${filenameTimestamp}_S.csv`);

    try {
        const liquidTemplate = fs.readFileSync(templateFilePath, { encoding: "utf-8" });
        const engine = new Liquid({ greedy: true });
        const output = await engine.parseAndRenderSync(liquidTemplate, { b_tolls_ntta_data, num_b_tolls_ntta_data: b_tolls_ntta_data.length, filenameTimestamp });
        fs.writeFileSync(outputFilePath, output, { encoding: "utf-8" });

        const endTime = process.hrtime(startTime);
        console.log('Time taken to generate the pipe output:', (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2) + 'ms');
    } catch (err) {
        console.error('Error generating and writing data:', err);
    }
}
generateAndWriteData();
