function logSuccess(message) {
  console.log(`${message}`);
}

function logError(message) {
  console.error(`${message}`);
}

module.exports = { logSuccess, logError };