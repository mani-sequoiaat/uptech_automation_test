const getDbClient = require('./utils/dbClient');
let _client = null;

async function initClient() {
    if (!_client) {
        _client = await getDbClient();
        console.log('init called');
    }
    return _client;
}

module.exports = {
    initClient,
    getClient: () => _client,
    setClient: (client) => { _client = client; }
};
