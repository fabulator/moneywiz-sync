require('cross-fetch/polyfill');
const { ZonkyApi } = require('zonky-api-handler');
const ZonkyWorkBook = require('./ZonkyWorkBook');
const ZonkyTransaction = require('./ZonkyTransaction');

const api = new ZonkyApi();

async function getZonkyTransactions(username, password) {
    await api.login(username, password, ZonkyApi.SCOPES.FILE_DOWNLOAD);

    const data = await api.downloadTransactions();

    const zonkyWorkBook = new ZonkyWorkBook(data);

    return zonkyWorkBook.getTransactions()
        .filter((transaction) => {
            return transaction.type === 'Splátka půjčky' || transaction.type === 'Poplatek za investování';
        })
        .map(transaction => new ZonkyTransaction(transaction));
}

module.exports = getZonkyTransactions;
