require('cross-fetch/polyfill');
const { ZonkyApi } = require('zonky-api-handler');
const ZonkyWorkBook = require('./ZonkyWorkBook');
const ZonkyTransaction = require('./ZonkyTransaction');

const api = new ZonkyApi();

async function getZonkyTransactions(username, password) {
    await api.login(username, password);

    const zonkyWorkBook = new ZonkyWorkBook(await api.downloadTransactions());

    return zonkyWorkBook.getTransactions(13)
        .filter((transaction) => {
            return transaction.type === 'Splátka půjčky' || transaction.type === 'Poplatek za investování';
        })
        .map(transaction => new ZonkyTransaction(transaction));
}

module.exports = getZonkyTransactions;
