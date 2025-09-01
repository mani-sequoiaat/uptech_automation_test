// index.test.js

describe('File Details Test Suite', () => {
  require('./validate-file-details.test');
});

describe('Batch Creation Test Suite', () => {
  require('./validate-batch.test');
});

describe('b-agreements Test Suite', () => {
  require('./validate-b-agreements-positive.test');
});

describe('s-agreements Test Suite', () => {
  require('./validate-s-agreements-positive.test');
});

// describe('s-agreements-error Test Suite', () => {
//   require('./ra-management/s-agreements-error/__test__/validate-s-agreements-error-positive.test');
//   require('./ra-management/s-agreements-error/__test__/1134-validate-s-agreements-null-lpn-lps.test');
//   require('./ra-management/s-agreements-error/__test__/1137-validate-s-agreements-lpn-exceed-12-charaters.test');
//   require('./ra-management/s-agreements-error/__test__/1138-validate-s-agreements-lps-not-2-characters.test');
//   require('./ra-management/s-agreements-error/__test__/1176-validate-s-agreements-lpn-special-characters.test');
//   require('./ra-management/s-agreements-error/__test__/1177-validate-s-agreements-lps-special-characters.test');
//   require('./ra-management/s-agreements-error/__test__/1180-validate-s-agreements-invalid-ra-number.test');
//   require('./ra-management/s-agreements-error/__test__/1181-validate-s-agreements-invalid-brand.test');
//   require('./ra-management/s-agreements-error/__test__/1182-validate-s-agreements-invalid-checkout.test');
//   require('./ra-management/s-agreements-error/__test__/1183-s-agreements-invalid-estimated-checkin.test');
//   require('./ra-management/s-agreements-error/__test__/1184-s-agreements-invalid-checkin.test');
// });

describe('agreements Test Suite', () => {
  require('./validate-agreements-positive.test');
});