const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { getDbClient, closeDbClient } = require('../../utils/dbClient');

// --- ADDED: Function to fetch toll locations from the database ---
async function getTollLocations(client) {
  // This query is updated to correctly extract 'video_rate' from the JSON properties column.
  const query = `
    SELECT 
        tr.toll_road_name,
        tp.plaza_name,
        v.variation_name,
        -- This line now correctly accesses the JSON data using the singular 'property'
        (trt.property -> 0 ->> 'video_rate')::numeric AS rate
    FROM "TollAuthority".toll_plaza tp
    JOIN "TollAuthority".variations v ON v.toll_plaza_id = tp.id
    JOIN "TollAuthority".toll_road tr ON tp.toll_road_id = tr.id
    JOIN "TollAuthority".toll_rate trt ON trt.toll_road_id = tr.id AND trt.exit_plaza_id = tp.id
    WHERE tr.toll_authority_id = 1
      AND LENGTH(v.variation_name) <= 6
      AND v.variation_name NOT IN ('PANYNJ', 'NYSTA', 'TBTA');
  `;

  console.log('Fetching toll locations from the database...');
  const { rows } = await client.query(query);

  if (!rows.length) {
    return []; // Return an empty array if no locations are found
  }

  // Map the database results to the format your script needs
  return rows.map(row => ({
    // Assuming the rate is in dollars (e.g., 16.06) and needs to be in cents (1606).
    toll: Math.round(row.rate * 100), 
    road: row.toll_road_name,
    plaza: row.plaza_name,
    lane: row.variation_name
  }));
}

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

  // --- MODIFIED: Fetch toll locations dynamically instead of using a hardcoded array ---
  const tollLocations = await getTollLocations(client);

  if (tollLocations.length === 0) {
      console.error('No toll locations found in the database. Aborting.');
      await closeDbClient();
      process.exit(1);
  }
  console.log(`Successfully fetched ${tollLocations.length} unique toll locations.`);
  // --- END MODIFICATION ---

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

  console.log('NTTA file generated successfully!');


  await closeDbClient();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Error generating NTTA file:', err);
  await closeDbClient();
  process.exit(1);
});

