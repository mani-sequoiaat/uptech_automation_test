const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { createObjectCsvWriter } = require('csv-writer');
const { getDbClient, closeDbClient } = require('../../utils/dbClient');

const entryExitCombinations = [
  { entry_plaza: 'Holland Tunnel Plaza', exit_plaza: 'Lincoln Tunnel Plaza', amount: 16.06 },
  { entry_plaza: 'George Washington Bridge', exit_plaza: 'Outerbridge Crossing', amount: 14.06 },
];

const agencies = [
  'E-ZPass New York',
  'EZ Pass NY',
  'E-ZPass NY',
  'EZPass New York',
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
    console.error('Please provide a valid count.');
    process.exit(1);
  }

  const client = await getDbClient();

  const query = `
    SELECT 
      a.id AS agreement_id,
      a.license_plate_number,
      a.license_plate_state,
      a.checkout_datetime,
      a.estimated_checkin_datetime,
      a.checkin_datetime
    FROM "FleetAgency".agreements a
    INNER JOIN "FleetAgency".fleet f
      ON a.license_plate_number = f.license_plate_number
     AND a.license_plate_state = f.license_plate_state
    WHERE f.is_active = TRUE
      AND f.fleet_end_date IS NULL
      AND f.registration_end_date IS NULL
    ORDER BY a.id DESC
    LIMIT 1000;
  `;

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
      'Lane Txn ID': generateLaneId(1211 + laneCounter++),
      'Tag/Plate #': `${row.license_plate_number}-${row.license_plate_state}`,
      'Posted Date': postedDate.format('YYYYMMDD'),
      'Agency': randomChoice(agencies),
      'Entry Plaza': plaza.entry_plaza,
      'Exit Plaza': plaza.exit_plaza,
      'Class': '',
      'Date': transactionDate.format('YYYYMMDD'),
      'Time': dayjs().format('HHmmss'),
      'Amount': plaza.amount.toFixed(2),
      'Post Txn Balance': 1,
    });
  }

  // ✅ Use relative path for saving file
  const outputDir = path.join(__dirname, '../generated-toll-files');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `ezpassny-toll-${dayjs().format('YYYYMMDDHHmmss')}.csv`;
  const outputPath = path.join(outputDir, fileName);

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'Lane Txn ID', title: 'Lane Txn ID' },
      { id: 'Tag/Plate #', title: 'Tag/Plate #' },
      { id: 'Posted Date', title: 'Posted Date' },
      { id: 'Agency', title: 'Agency' },
      { id: 'Entry Plaza', title: 'Entry Plaza' },
      { id: 'Exit Plaza', title: 'Exit Plaza' },
      { id: 'Class', title: 'Class' },
      { id: 'Date', title: 'Date' },
      { id: 'Time', title: 'Time' },
      { id: 'Amount', title: 'Amount' },
      { id: 'Post Txn Balance', title: 'Post Txn Balance' },
    ],
  });

  await csvWriter.writeRecords(tollRecords);
  console.log(`✅ EZPassNY Toll file generated successfully: ${outputPath}`);
  console.log(`Total records: ${tollRecords.length}`);

  await closeDbClient();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('❌ Error generating toll file:', err);
  await closeDbClient();
  process.exit(1);
});
