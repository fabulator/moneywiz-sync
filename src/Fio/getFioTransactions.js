require('cross-fetch/polyfill');
const { EnhacedFioApi } = require('fio-api-handler');

async function getFioTransactions(apiKey, from, to) {
    const fioApi = new EnhacedFioApi(apiKey);

    const { transactions } = await fioApi.getTransactions(from, to);

    return transactions;
}

module.exports = getFioTransactions;
