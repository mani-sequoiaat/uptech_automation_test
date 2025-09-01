const fs = require('fs');
const path = require('path');

function readSQLFile(filePath) {
  return fs.readFileSync(path.resolve(__dirname, '..', filePath), 'utf-8');
}

module.exports = { readSQLFile };