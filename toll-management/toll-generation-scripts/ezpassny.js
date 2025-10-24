const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { getDbClient, closeDbClient } = require('../../utils/dbClient');


async function getTollLocations(client) {

  const query = `
    SELECT
        entry_plaza.plaza_name AS entry_plaza_name,
        exit_plaza.plaza_name AS exit_plaza_name,
        (trt.property -> 0 ->> 'video_rate')::numeric AS rate
    FROM "TollAuthority".toll_rate trt
    -- Join twice on the plaza table to get names for both entry and exit IDs
    JOIN "TollAuthority".toll_plaza AS entry_plaza ON trt.entry_plaza_id = entry_plaza.id
    JOIN "TollAuthority".toll_plaza AS exit_plaza ON trt.exit_plaza_id = exit_plaza.id
    -- Join to the road table to filter by the correct authority
    JOIN "TollAuthority".toll_road tr ON entry_plaza.toll_road_id = tr.id
    WHERE tr.toll_authority_id = 2;
  `;

  console.log('Fetching E-ZPass NY toll locations from the database...');
  const { rows } = await client.query(query);

  if (!rows.length) {
    return [];
  }


  return rows.map(row => ({
    amount: parseFloat(row.rate),
    entryPlaza: row.entry_plaza_name,
    exitPlaza: row.exit_plaza_name,
  }));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const count = parseInt(process.argv[2], 10);
  if (!count || count <= 0) {
    console.error('Please provide a valid record count. Example: node ezpassny.js 20');
    process.exit(1);
  }

  const client = await getDbClient();
  const tollLocations = await getTollLocations(client);

  if (tollLocations.length === 0) {
    console.error('No E-ZPass NY toll locations found. Aborting.');
    await closeDbClient();
    process.exit(1);
  }
  console.log(`Successfully fetched ${tollLocations.length} unique E-ZPass NY locations.`);

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

  const outputDir = path.join(__dirname, '../generated-toll-files/ezpassny');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const now = dayjs();
  const fileName = `ezpassny-toll-${now.format('YYYYMMDDHHmmss')}.csv`;
  const outputPath = path.join(outputDir, fileName);

  const lines = [];
  const header = 'Lane Txn ID,Tag/Plate #,Posted Date,Agency,Entry Plaza,Exit Plaza,Class,Date,Time,Amount,Post Txn Balance';
  lines.push(header);

  for (let i = 0; i < Math.min(count, rows.length); i++) {
    const row = rows[i];
    const checkout = dayjs(row.checkout_datetime);
    const location = randomChoice(tollLocations);

    const transactionDate = checkout.add(1, 'day')
        .hour(now.hour())
        .minute(now.minute())
        .second(now.second());

    const postedDate = transactionDate.subtract(1, 'day');

    const laneTxnId = 12121 + i;
    const tagPlate = `${row.license_plate_number}-${row.license_plate_state}`;
    const agency = 'E-ZPass NY';

    const entryPlaza = location.entryPlaza;
    const exitPlaza = location.exitPlaza;
    const vehicleClass = '';
    const dateStr = transactionDate.format('YYYYMMDD');
    const timeStr = transactionDate.format('HHmmss');
    const amount = location.amount.toFixed(2);
    const postTxnBalance = '1';

    lines.push([
      laneTxnId,
      tagPlate,
      postedDate.format('YYYYMMDD'),
      agency,
      entryPlaza,
      exitPlaza,
      vehicleClass,
      dateStr,
      timeStr,
      amount,
      postTxnBalance,
    ].join(','));
  }

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');

  console.log('E-ZPass NY Toll file generated successfully!');
  console.log(`Location: ${outputPath}`);
  console.log(`Total records (excluding header): ${lines.length - 1}`);

  await closeDbClient();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('❌ Error generating E-ZPass NY file:', err);
  await closeDbClient();
  process.exit(1);
});

