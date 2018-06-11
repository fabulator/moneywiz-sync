const {
    TRANSACTION_TYPE_TRANSFER_IN,
    TRANSACTION_TYPE_TRANSFER_OUT,
} = require('./transaction-types');

class MoneyWizAccount {
    constructor(accountId, database) {
        this.db = database;
        this.timeFormat = 'yyyy-MM-dd HH:mm:ss';
        this.accountId = accountId;
    }

    async findTransaction(transaction) {
        const data = transaction.getDataForSql();
        const transfer = transaction.getTransferToAccount();
        const recipientAccountId = data.$RecipientAccountId;
        const senderAccountId = transfer && transaction.getAmount() > 0 ? transfer : null;

        return await this.db.all(`SELECT * From Transactions WHERE Amount LIKE $amount AND Date >= $dateMin AND Date <= $dateMax AND PayeeId ${transaction.getPayee() ? '=' : 'IS'} $Payee AND AccountId = $AccountId AND RecipientAccountId ${recipientAccountId ? '=' : 'IS'} $RecipientAccountId AND SenderAccountId ${senderAccountId ? '=' : 'IS'} $SenderAccountId`, {
            $amount: transaction.getAmount(),
            $dateMin: transaction.getDate().startOf('day').toFormat(this.timeFormat),
            $dateMax: transaction.getDate().endOf('day').toFormat(this.timeFormat),
            $Payee: transaction.getPayee(),
            $RecipientAccountId: recipientAccountId,
            $SenderAccountId: senderAccountId,
            $AccountId: this.accountId,
        });
    }

    async isTransactionExists(transaction) {
        const found = await this.findTransaction(transaction);
        return found.length > 0;
    }

    async getLastTransactionId() {
        const { Id } = await this.db.get(`SELECT * From Transactions ORDER BY Id DESC`);
        return Id;
    }

    async getLastCategoryId() {
        const { Id } = await this.db.get(`SELECT * From CategoryAssigments ORDER BY Id DESC`);
        return Id;
    }

    async insertTransaction(transaction, dry = false) {
        const data = transaction.getDataForSql();
        const date = transaction.getDate().startOf('day').toFormat(this.timeFormat);
        const transfer = transaction.getTransferToAccount();
        const id = await this.getLastTransactionId() + 1;
        if (transfer) {
            const amount = transaction.getAmount();

            await this.insertTransactionData({
                ...data,
                $Date: date,
                $Id: id,
                $AccountId: this.accountId,
                $RecipientTransactionId: amount < 0 ? id + 1 : null,
                $SenderTransactionId: amount > 0 ? id + 1 : null,
            }, null, dry);

            return this.insertTransactionData({
                ...transaction.getDataForSql(),
                $Date: date,
                $Amount: -data.$Amount,
                $OriginalAmount: -data.$OriginalAmount,
                $Id: id + 1,
                $RecipientTransactionId: amount > 0 ? id : null,
                $SenderTransactionId: amount < 0 ? id : null,
                $RecipientAccountId: amount > 0 ? this.accountId : null,
                $SenderAccountId: amount < 0 ? this.accountId : null,
                $AccountId: transfer,
                $TransactionType: data.$TransactionType === TRANSACTION_TYPE_TRANSFER_IN ? TRANSACTION_TYPE_TRANSFER_OUT : TRANSACTION_TYPE_TRANSFER_IN,
            }, null, dry);
        }

        return this.insertTransactionData({
            ...data,
            $Date: date,
            $AccountId: this.accountId,
            $Id: id,
        }, transaction.getCategory(), dry);
    }

    async insertTransactionData(data, category, dry = false) {
        if (dry) {
            console.log(data);
            return;
        }

        await this.db.run('INSERT INTO Transactions(AccountId, Amount, OriginalAmount, Date, Description, Id, ObjectGid, CurrencyExchangeRate, Reconciled, Status, TransactionType, CreatedDate, LastModifiedDate, OriginalCurrency, OriginalExchangeRate, PayeeId, RecipientAccountId, RecipientTransactionId, SenderAccountId, SenderTransactionId) VALUES ($AccountId, $Amount, $OriginalAmount, $Date, $Description, $Id, $ObjectGid, $CurrencyExchangeRate, $Reconciled, $Status, $TransactionType, $CreatedDate, $LastModifiedDate, $OriginalCurrency, $OriginalExchangeRate, $Payee, $RecipientAccountId, $RecipientTransactionId, $SenderAccountId, $SenderTransactionId)', data);

        let categoryId = category;

        if (!categoryId && data.$Payee) {
            categoryId = await this.getLastCategoryOfPayee(data.$Payee);
        }

        if (categoryId) {
            await this.db.run('INSERT INTO CategoryAssigments(Id, Amount, CategoryId, TransactionId, IsChecked) VALUES ($Id, $Amount, $CategoryId, $TransactionId, $IsChecked)', {
                $Id: (await this.getLastCategoryId()) + 1,
                $Amount: data.$Amount,
                $CategoryId: categoryId,
                $TransactionId: data.$Id,
                $IsChecked: 0,
            });
        }
    }

    async getLastCategoryOfPayee(payeeId) {
        const results = await this.db.get(`SELECT CategoryAssigments.CategoryId FROM Transactions JOIN CategoryAssigments ON Transactions.Id = CategoryAssigments.TransactionId WHERE PayeeId = ${payeeId} ORDER BY Date DESC`);

        return results ? results.CategoryId : null;
    }

    async updateOriginalCurrency(id, transaction) {
        const data = transaction.getDataForSql();

        return this.run('UPDATE Transactions SET OriginalAmount = $OriginalAmount, OriginalCurrency = $OriginalCurrency, OriginalExchangeRate = $OriginalExchangeRate WHERE Id = $Id', {
            $Id: id,
            $OriginalAmount: data.$OriginalAmount,
            $OriginalCurrency: data.$OriginalCurrency,
            $OriginalExchangeRate: data.$OriginalExchangeRate,
        });
    }
}

module.exports = MoneyWizAccount;
