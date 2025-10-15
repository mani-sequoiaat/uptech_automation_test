const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { getDbClient, closeDbClient } = require('../../utils/dbClient');

// --- Sample toll locations ---
const tollLocations = [
  { toll: 205, road: 'Mountain Creek Lake Bridge', plaza: 'MainLnP1', lane: '5' },
  { toll: 1500, road: 'Addison Airport Toll Tunnel', plaza: 'AATl', lane: '5' },
  { toll: 300, road: 'CTP', plaza: 'FM917', lane: 'SPARD-5' },
  { toll: 400, road: 'CTP', plaza: 'CR913', lane: 'MLG3-5' },
  { toll: 1500, road: 'AATT', plaza: 'AATT', lane: '5' },
  { toll: 1000, road: 'MCLB', plaza: 'MCLB', lane: '5' },
  { toll: 1500, road: 'AATT', plaza: 'Unmatched', lane: '5' },
  { toll: 1500, road: 'AATT', plaza: 'AATT', lane: '5' },
];

// --- Helper ---
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const count = parseInt(process.argv[2], 10);
  if (!count || count <= 0) {
    console.error('Please provide a valid record count. Example: node ntta.js 10');
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

  const outputDir = path.join(__dirname, '../generated-toll-files/ntta');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const fileDate = dayjs();
  const fileSeq = '000000001';
  // --- No extension ---
  const fileName = `UTS_VC_${fileDate.format('YYYYMMDDHHmmss')}_S`;
  const outputPath = path.join(outputDir, fileName);

  const lines = [];

  // --- REQHD line ---
  lines.push([
    'REQHD',
    'NTTA',
    fileSeq,
    fileDate.format('YYYYMMDDHHmmss'),
    count, // number of records
    fileName
  ].join('|'));

  // --- REQDT lines ---
  for (let i = 0; i < Math.min(count, rows.length); i++) {
    const row = rows[i];
    const txnDate = dayjs(row.checkout_datetime).format('YYYYMMDDHHmmss');
    const location = randomChoice(tollLocations);
    const tollDesc = `${location.road}-${location.plaza}-${location.lane}`;

    lines.push([
      'REQDT',
      (i + 1).toString().padStart(7, '0'),
      row.account_number || '405012180000002',
      row.license_plate_number,
      row.license_plate_state,
      txnDate,
      location.toll,
      '000',
      '000',
      location.toll,
      tollDesc
    ].join('|'));
  }

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');

  console.log('NTTA ASCII file generated successfully!');
  console.log(`Location: ${outputPath}`);
  console.log(`Total records: ${lines.length - 1}`);

  await closeDbClient();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Error generating NTTA file:', err);
  await closeDbClient();
  process.exit(1);
});
