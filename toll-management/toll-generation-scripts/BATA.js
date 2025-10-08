
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { createObjectCsvWriter } = require('csv-writer');
const { getDbClient, closeDbClient } = require('../../utils/dbClient');

const entryExitCombinations = [
  { exit_plaza: 'Carquinez Bridge', amount: 8.0 },
  { exit_plaza: 'Benicia', amount: 8.0 },
  { exit_plaza: 'Bay Bridge', amount: 4.0 },
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLaneId(index) {
  return String(index).padStart(4, '0');
}

async function main() {
  const count = parseInt(process.argv[2], 10);
  if (!count || count <= 0) {
    console.error('Provide a valid count.');
    process.exit(1);
  }

  const client = await getDbClient();

 
  const sqlFilePath = path.join(__dirname, '../SQL/Active_fleet_RA.sql');

  let query;
  try {
    query = fs.readFileSync(sqlFilePath, 'utf8');
  } catch (err) {
    console.error(`Failed to read SQL file at ${sqlFilePath}:`, err);
    process.exit(1);
  }

  const { rows } = await client.query(query);

  if (!rows.length) {
    console.error('No active Fleet + Agreement records found.');
    await closeDbClient();
    process.exit(2);
  }

  const tollRecords = [];
  let laneCounter = 1;
  let dbIndex = 0;

  while (tollRecords.length < count) {
    if (dbIndex >= rows.length) {
      console.warn('Not enough eligible records in DB to generate requested count.');
      break;
    }

    const row = rows[dbIndex];
    dbIndex++;

    const checkout = dayjs(row.checkout_datetime);

    // Transaction date = checkout + 1 day
    const transactionDate = checkout.add(1, 'day');

    // Skip if transaction date is today or in the future
    if (transactionDate.isAfter(dayjs().subtract(1, 'day'))) {
      continue; // pick next record
    }

    const postedDate = transactionDate.subtract(2, 'day');
    const plaza = randomChoice(entryExitCombinations);

    tollRecords.push({
      'POSTED DATE': postedDate.format('MM/DD/YYYY'),
      'TRANSACTION DATE': transactionDate.format('MM/DD/YYYY'),
      'TRANSACTION TIME': dayjs().format('h:mm:ss A'),
      'TOLL TAG # / PLATE #': `${row.license_plate_number}-${row.license_plate_state}`,
      'EXIT PLAZA': plaza.exit_plaza,
      'EXIT LANE': 7,
      'ENTRY DATE/TIME': '',
      'ENTRY PLAZA': '',
      'ENTRY LANE': '',
      'DEBIT(-)': `$${plaza.amount.toFixed(2)}`,
      'CREDIT(+)': '',
      'BALANCE': '',
    });

    laneCounter++;
  }

  
  const outputDir = path.join(__dirname, '../generated-toll-files/bata');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `BATA_${dayjs().format('YYYYMMDDHHmmss')}.csv`;
  const outputPath = path.join(outputDir, fileName);

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'POSTED DATE', title: 'POSTED DATE' },
      { id: 'TRANSACTION DATE', title: 'TRANSACTION DATE' },
      { id: 'TRANSACTION TIME', title: 'TRANSACTION TIME' },
      { id: 'TOLL TAG # / PLATE #', title: 'TOLL TAG # / PLATE #' },
      { id: 'EXIT PLAZA', title: 'EXIT PLAZA' },
      { id: 'EXIT LANE', title: 'EXIT LANE' },
      { id: 'ENTRY DATE/TIME', title: 'ENTRY DATE/TIME' },
      { id: 'ENTRY PLAZA', title: 'ENTRY PLAZA' },
      { id: 'ENTRY LANE', title: 'ENTRY LANE' },
      { id: 'DEBIT(-)', title: 'DEBIT(-)' },
      { id: 'CREDIT(+)', title: 'CREDIT(+)' },
      { id: 'BALANCE', title: 'BALANCE' },
    ],
  });

  await csvWriter.writeRecords(tollRecords);
  console.log(`BATA Toll file generated successfully: ${outputPath}`);
  console.log(`Total records: ${tollRecords.length}`);

  await closeDbClient();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Error generating TCA toll file:', err);
  await closeDbClient();
  process.exit(1);
});
