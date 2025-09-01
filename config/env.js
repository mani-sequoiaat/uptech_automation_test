const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

module.exports = {
  sqlPaths: {
    fileDetails: path.join(process.env.FILE_DETAILS_SQL_PATH),
    bFleet: path.join(process.env.B_FLEET_SQL_PATH),
    sFleet: path.join(process.env.S_FLEET_SQL_PATH)
  },
  dbConfig: {
    host: process.env.AZURE_DATABASE_HOST,
    database: process.env.AZURE_DATABASE_NAME,
    user: process.env.AZURE_DB_USER,
    tokenScope: 'https://ossrdbms-aad.database.windows.net'
  }
};
