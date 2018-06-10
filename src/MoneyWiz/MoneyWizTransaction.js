const { DateTime } = require('luxon');
const {
    TRANSACTION_TYPE_EXPENSE,
    TRANSACTION_TYPE_INCOME,
    TRANSACTION_TYPE_TRANSFER_IN,
    TRANSACTION_TYPE_TRANSFER_OUT,
} = require('./transaction-types');

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4() + '-' + s4() + '-' + s4() + s4() + s4() + s4();
}

class MoneyWizTransaction {
    constructor(data) {
        this.data = data;
        this.timeFormat = 'yyyy-MM-dd HH:mm:ss';
    }

    getAmount() {
        return this.data.amount;
    }

    getOriginalAmount() {
        return this.data.originalAmount;
    }

    getCurrency() {
        return this.data.currency;
    }

    getTransferToAccount() {
        return this.data.transferTo;
    }

    getDate() {
        return this.data.date;
    }

    getDescription() {
        return this.data.description;
    }

    getPayee() {
        return this.data.payee;
    }

    getCategory() {
        return this.data.category;
    }

    getTransactionType() {
        if (this.getTransferToAccount()) {
            return this.getAmount() > 0 ? TRANSACTION_TYPE_TRANSFER_IN : TRANSACTION_TYPE_TRANSFER_OUT;
        }

        return this.getAmount() > 0 ? TRANSACTION_TYPE_INCOME : TRANSACTION_TYPE_EXPENSE;
    }

    getDataForSql() {
        const now = DateTime.local().startOf('day').toFormat(this.timeFormat);
        const transferTo = this.getTransferToAccount();

        return {
            $Amount: this.getAmount(),
            $OriginalAmount: this.getOriginalAmount(),
            $OriginalCurrency: this.getCurrency(),
            $CurrencyExchangeRate: Math.abs(this.getAmount() / this.getOriginalAmount()),
            $OriginalExchangeRate: 1,
            $Date: this.getDate(),
            $Description: this.getDescription(),
            $ObjectGid: guid().toUpperCase(),
            $Reconciled: 0,
            $Status: 2,
            $TransactionType: this.getTransactionType(),
            $CreatedDate: now,
            $LastModifiedDate: now,
            $Payee: this.getPayee(),
            $RecipientAccountId: transferTo && this.getAmount() < 0 ? transferTo : null,
            $RecipientTransactionId: null,
            $SenderAccountId: transferTo && this.getAmount() > 0 ? transferTo : null,
            $SenderTransactionId: null,
        };
    }
}

module.exports = MoneyWizTransaction;
