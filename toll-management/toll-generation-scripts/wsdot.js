const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { getDbClient, closeDbClient } = require('../../utils/dbClient');

// --- Static array for WSDOT toll descriptions ---
const wsdotTollData = [
  { description: 'SR 520 Bridge - Lane 01', type: 'Toll - Good to Go! - Reversal', amount: 4.90 },
  { description: 'SR 99 Tunnel - Lane 02', type: 'Toll - Good to Go! - Reversal', amount: 2.80 },
  { description: 'SR 16 Tacoma Narrows Bridge - Lane 03', type: 'Toll - Good to Go! - Reversal', amount: 4.50 },
];

// --- Helper functions ---
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTime() {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  return { hour, minute };
}

// --- Main Execution ---
async function main() {
  const count = parseInt(process.argv[2], 10);
  if (!count || count <= 0) {
    console.error('Please provide a valid record count. Example: node wsdot.js 30');
    process.exit(1);
  }

  const client = await getDbClient();

  // --- Read SQL file to get active fleet plates ---
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

  // --- Generate Toll Records ---
  const tollRecords = [];
  let dbIndex = 0;

  while (tollRecords.length < count) {
    if (dbIndex >= rows.length) {
      console.warn('Not enough eligible records in DB to generate requested count.');
      break;
    }

    const dbRow = rows[dbIndex++];
    const jsonRecord = randomChoice(wsdotTollData);

    // --- Transaction date logic ---
    const checkout = dayjs(dbRow.checkout_datetime);
    const transactionDate = checkout.add(1, 'day');

    // Skip if transaction date is today or in the future
    if (transactionDate.isAfter(dayjs().subtract(1, 'day'))) {
      continue;
    }

    // Posted Date = transaction date - 2 days
    const postedDate = transactionDate.subtract(2, 'day');

    // Trip date = transaction date + random hour/minute
    const { hour, minute } = randomTime();
    const tripDateTime = transactionDate.hour(hour).minute(minute).second(0);

    // This is the crucial part: .format('MM/DD/YYYY') ensures slashes are used.
    tollRecords.push({
      'Posted Date': postedDate.format('MM/DD/YYYY'),
      'Type': jsonRecord.type,
      'Trip date': tripDateTime.format('MM/DD/YYYY HH:mm'),
      'Description': jsonRecord.description,
      'Plate / Pass': `${dbRow.license_plate_number} ${dbRow.license_plate_state}`,
      'Amount': jsonRecord.amount,
      'Balance': '',
    });
  }
  

  // --- Output directory setup ---
  const outputDir = path.join(__dirname, '../generated-toll-files/wsdot');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `wsdot-toll-${dayjs().format('YYYYMMDDHHmmss')}.csv`;
  const outputPath = path.join(outputDir, fileName);

  // --- Write comma-delimited CSV file ---
  const header = [
    'Posted Date',
    'Type',
    'Trip date',
    'Description',
    'Plate / Pass',
    'Amount',
    'Balance'
  ].join(',');

  const lines = tollRecords.map(r =>
    [
      r['Posted Date'],
      r['Type'],
      r['Trip date'],
      r['Description'],
      r['Plate / Pass'],
      r['Amount'],
      r['Balance']
    ].join(',')
  );

  fs.writeFileSync(outputPath, [header, ...lines].join('\n'), 'utf8');

  console.log('WSDOT Toll file (comma-delimited CSV) generated successfully!');

  await closeDbClient();
  process.exit(0);
}

// --- Run ---
main().catch(async (err) => {
  console.error('Error generating WSDOT Toll file:', err);
  await closeDbClient();
  process.exit(1);
});