const vorpal = require('vorpal');
const { DateTime } = require('luxon');
const SqlLiteDatabase = require('./MoneyWiz/SqlLiteDatabase');
const MoneyWizAccount = require('./MoneyWiz/MoneyWizAccount');
const getZonkyTransactions = require('./Zonky/getZonkyTransactions');
const getFioTransactions = require('./Fio/getFioTransactions');
const convert = require('./convert');
const { zonky, dbLocation, fio } = require('./settings');

const sqlLiteDatabase = new SqlLiteDatabase(dbLocation);

async function addMissingTransactions(transactions, accountId, dry) {
    const moneyWizAccount = new MoneyWizAccount(accountId, sqlLiteDatabase);
    const moneyWizTransactions = transactions.map((item) => {
        return convert(item);
    });

    for (let key in moneyWizTransactions) {
        const transaction = moneyWizTransactions[key];

        const items = await moneyWizAccount.findTransaction(transaction);

        if (items.length === 0) {
            await moneyWizAccount.insertTransaction(transaction, dry);
        }
    }

}

async function addMissingZonkyTransactions(dry) {
    return addMissingTransactions(
        await getZonkyTransactions(zonky.username, zonky.password),
        zonky.accountId,
        dry,
    );
}

async function addMissingFioTransactions(dry) {
    for (let key in fio) {
        const fioSettings = fio[key];

        await addMissingTransactions(
            await getFioTransactions(
                fioSettings.key,
                DateTime.local().minus({
                    day: 30,
                }),
                DateTime.local(),
            ),
            fioSettings.accountId,
            dry,
        );
    }
}

(async () => {
    const program = vorpal();

    program
        .command('sync:zonky')
        .option('-w, --write', 'Write items to db.')
        .action(async ({ options }) => {
            await addMissingZonkyTransactions(!options.write);
        });

    program
        .command('sync:fio')
        .option('-w, --write', 'Write items to db.')
        .action(async ({ options }) => {
            await addMissingFioTransactions(!options.write);
        });

    program
        .show()
        .parse(process.argv);
})();
