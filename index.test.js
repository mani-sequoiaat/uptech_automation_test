// index.test.js
// const getDbClient = require('./utils/dbClient');
// const sharedClient = require('./sharedClient'); // ...existing code...
// const realClient = await getDbClient();
// client.setClient(realClient); 

const { getDbClient, closeDbClient } = require('./utils/dbClient');

beforeAll(async () => {
  await getDbClient();
}, 15000);

afterAll(async () => {
  await closeDbClient();
});

// Fleet tests
describe('Fleet - file_details Test Suite', () => {
  require('./fleet-management/test/validate-fleet-file-details.test');
});  

describe('Fleet - batch Creation Test Suite', () => {  
  require('./fleet-management/test/validate-fleet-batch.test');
});

describe('Fleet - b_fleet Test Suite', () => {
  require('./fleet-management/test/validate-b-fleet.test');
});  

describe('Fleet - s_fleet_error Test Suite', () => {
  require('./fleet-management/test/validate-s-fleet-error.test');
});  

describe('Fleet - s_fleet Test Suite', () => {
  require('./fleet-management/test/validate-s-fleet.test');
});  
  
describe('Fleet - s_fleet_delta infleet Test Suite', () => {  
  require('./fleet-management/test/validate-s-fleet-delta-infleet.test');
});  

describe('Fleet - s_fleet_delta defleet Test Suite', () => {
  require('./fleet-management/test/validate-s-fleet-delta-defleet.test');
});

describe('Fleet - s_fleet_delta update Test Suite', () => {
  require('./fleet-management/test/validate-s-fleet-delta-update.test');
});

describe('Fleet - fleet Test Suite', () => {
  require('./fleet-management/test/validate-fleet.test');
});

describe('Fleet - fleet_history Test Suite', () => {
  require('./fleet-management/test/validate-fleet-history.test');
});

describe('Fleet - registration_delta Test Suite', () => {
  require('./fleet-management/test/validate-registration-delta.test');
});

describe('Fleet - registration Test Suite', () => {
  require('./fleet-management/test/validate-registration.test');
});

// RA tests
describe('RA - file_details Test Suite', () => {
  require('./ra-management/__test__/validate-ra-file-details.test');
});

describe('RA - batch Creation Test Suite', () => {
  require('./ra-management/__test__/validate-ra-batch.test');
});

describe('RA - b_agreements Test Suite', () => {
  require('./ra-management/__test__/validate-ra-b-agreements-positive.test');
});

describe('RA - s_agreements Test Suite', () => {
  require('./ra-management/__test__/validate-ra-s-agreements-positive.test');
});

// // describe('s-agreements-error Test Suite', () => {
// //   require('./ra-management/s-agreements-error/__test__/validate-s-agreements-error-positive.test');
// //   require('./ra-management/s-agreements-error/__test__/1134-validate-s-agreements-null-lpn-lps.test');
// //   require('./ra-management/s-agreements-error/__test__/1137-validate-s-agreements-lpn-exceed-12-charaters.test');
// //   require('./ra-management/s-agreements-error/__test__/1138-validate-s-agreements-lps-not-2-characters.test');
// //   require('./ra-management/s-agreements-error/__test__/1176-validate-s-agreements-lpn-special-characters.test');
// //   require('./ra-management/s-agreements-error/__test__/1177-validate-s-agreements-lps-special-characters.test');
// //   require('./ra-management/s-agreements-error/__test__/1180-validate-s-agreements-invalid-ra-number.test');
// //   require('./ra-management/s-agreements-error/__test__/1181-validate-s-agreements-invalid-brand.test');
// //   require('./ra-management/s-agreements-error/__test__/1182-validate-s-agreements-invalid-checkout.test');
// //   require('./ra-management/s-agreements-error/__test__/1183-s-agreements-invalid-estimated-checkin.test');
// //   require('./ra-management/s-agreements-error/__test__/1184-s-agreements-invalid-checkin.test');
// // });

describe('RA - agreements Test Suite', () => {
  require('./ra-management/__test__/validate-ra-agreements-positive.test');
});