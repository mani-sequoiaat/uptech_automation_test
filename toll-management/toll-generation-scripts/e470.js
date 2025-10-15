const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { getDbClient, closeDbClient } = require('../../utils/dbClient');

// --- Toll Location Codes & Toll Amounts ---
const tollLocations = [
  { code: 12, toll: 1.25 },
  { code: 91, toll: 2.50 },
  { code: 0, toll: 3.05 },
  { code: 39, toll: 5.60 },
  { code: 42, toll: 7.65 },
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const count = parseInt(process.argv[2], 10);
  if (!count || count <= 0) {
    console.error(' Please provide a valid record count. Example: node e470.js 20');
    process.exit(1);
  }

  const client = await getDbClient();
  const sqlFilePath = path.join(__dirname, '../SQL/Active_fleet_RA.sql');
  let query;
  try {
    query = fs.readFileSync(sqlFilePath, 'utf8');
  } catch (err) {
    console.error(` Failed to read SQL file at ${sqlFilePath}:`, err);
    process.exit(1);
  }

  const { rows } = await client.query(query);
  if (!rows.length) {
    console.error(' No active Fleet + Agreement records found.');
    await closeDbClient();
    process.exit(2);
  }

  const outputDir = path.join(__dirname, '../generated-toll-files/e470');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const fileDate = dayjs();
  const fileName = `E470_${fileDate.format('YYYYMMDDHHmmss')}.txt`;
  const outputPath = path.join(outputDir, fileName);

  const direction = 'D';
  const typeCode = 1;
  const daysToAdd = 5; // posted_date = txn_date + 5 days
  const nowTime = dayjs();

  const lines = [];
  let totalToll = 0;
  let totalAmount = 0;

  for (let i = 0; i < Math.min(count, rows.length); i++) {
    const row = rows[i];

    if (!row.license_plate_number || !row.license_plate_state) {
      console.warn(`Skipping record due to missing LPN or LPS: ${JSON.stringify(row)}`);
      continue;
    }

    // Transaction date = checkout + 1 day, use current HHmmss, cap to now
    let txnDate = dayjs(row.checkout_datetime).add(1, 'day');
    txnDate = txnDate.hour(nowTime.hour()).minute(nowTime.minute()).second(nowTime.second());
    if (txnDate.isAfter(nowTime)) txnDate = nowTime;

    // Posted date = txnDate + daysToAdd
    const postedDate = txnDate.add(daysToAdd, 'day');

    const loc = randomChoice(tollLocations);
    const total = (loc.toll + (Math.random() * 5 + 1)).toFixed(2); // random total

    totalToll += loc.toll;
    totalAmount += parseFloat(total);

    lines.push([
      row.license_plate_state,
      row.license_plate_number,
      txnDate.format('YYYYMMDD-HHmmss'),
      loc.code,
      typeCode,
      postedDate.format('YYYYMMDD-HHmmss'),
      direction,
      loc.toll.toFixed(2),
      total
    ].join(','));
  }

  // Add trailer record (ST01)
  lines.push([
    'ST01',
    lines.length,
    totalToll.toFixed(2),
    totalAmount.toFixed(2)
  ].join(','));

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');

  console.log(' E470 Toll file generated successfully!');
  console.log(` Location: ${outputPath}`);
  console.log(` Total records: ${lines.length - 1}`);
  console.log(` Total Toll: ${totalToll.toFixed(2)}, Total Amount: ${totalAmount.toFixed(2)}`);

  await closeDbClient();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(' Error generating E470 file:', err);
  await closeDbClient();
  process.exit(1);
});
