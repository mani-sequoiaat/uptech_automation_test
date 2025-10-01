const fs = require('fs');
const path = require('path');

function loadJson(folderOrFile, maybeFile) {
  const basePath = 'D:/Uptech-Test-Automation/fleet-management/json';
  const filePath = maybeFile
    ? path.join(basePath, folderOrFile, maybeFile) // folder + file
    : path.join(basePath, folderOrFile);           // just file

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const {
  fetchLatestFleetFile,
  fetchBatchesByFileId,
  fetchFleetRecordsForbronze,
  fetchFleetRecordsForbronzeerror,
  fetchValidFleetRecordsForSilverDelta,
  fetchFleetRecordsForSilverDeltaInfleet,
  fetchFleetRecordsForSilverDeltadefleet,
  fetchFleetRecordsForSilverDeltaupdate,
  fetchFleetRecordsForfleet,
  fetchFleetRecordsForfleetderegistration,
  fetchFleetRecordsFordeltaactiontobetaken,
  fetchFleetRecordsForfleethistory,
  fetchFleetRecordsForregistrationdelta,
  fetchFleetRecordsForregistrationdeltadereg,
  fetchFleetRecordsForregistration,
  fetchFleetRecordsForregistrationdereg,
  fetchtodayrecords

} = require('./fleetSqlRunner.js');

module.exports = {
  loadJson,
  fetchLatestFleetFile,
  fetchBatchesByFileId,
  fetchFleetRecordsForbronze,
  fetchFleetRecordsForbronzeerror,
  fetchValidFleetRecordsForSilverDelta,
  fetchFleetRecordsForSilverDeltaInfleet,
  fetchFleetRecordsForSilverDeltadefleet,
  fetchFleetRecordsForSilverDeltaupdate,
  fetchFleetRecordsForfleet,
  fetchFleetRecordsForfleetderegistration,
  fetchFleetRecordsFordeltaactiontobetaken,
  fetchFleetRecordsForfleethistory,
  fetchFleetRecordsForregistrationdelta,
  fetchFleetRecordsForregistrationdeltadereg,
  fetchFleetRecordsForregistration,
  fetchFleetRecordsForregistrationdereg,
  fetchtodayrecords

};
