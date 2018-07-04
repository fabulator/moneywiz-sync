const MoneyWizTransaction = require('./../MoneyWiz/MoneyWizTransaction');

class MoneyWizConvertor {
    constructor(transaction, payeeList, transferList, categoryList) {
        this.transaction = transaction;
        this.payeeList = payeeList;
        this.transferList = transferList;
        this.categoryList = categoryList;
    }

    getPayeeByMessage() {
        const message = `${this.transaction.data.type ? `${this.transaction.data.type}: ` : ''}${this.transaction.getMessage()}`;

        if (!message) {
            return null;
        }

        const lowerCasedMessage = message.toLowerCase();

        const messagePayee = this.payeeList.messagePayeeList.find(payye => lowerCasedMessage.includes(payye.name.toLowerCase()));

        return messagePayee ? messagePayee.id : null;
    }

    getPayeeByTransactionId() {
        const transactionIdPayee = this.payeeList.idPayeeList.find(payee => this.transaction.getTransactionId() === payee.transactionId);

        return transactionIdPayee ? transactionIdPayee.id : null;
    }

    getPayeeByBankNumber() {
        if (!this.transaction.getCounterpartyAccountNumber()) {
            return null;
        }

        const bankPayee = this.payeeList.bankNumberPayeeList.find(bank => this.transaction.getCounterpartyAccountNumber() === bank.bank);

        return bankPayee ? bankPayee.id : null;
    }

    getPayee() {
        let payee = null;

        [this.getPayeeByTransactionId, this.getPayeeByBankNumber, this.getPayeeByMessage].find((fn) => {
            payee = fn.call(this);
            return payee || false;
        });

        return payee;
    }

    getTransferAccount() {
        const account = this.transferList.find((account) => {
            const transactionMessage = this.transaction.getMessage();
            return account.banks.includes(this.transaction.getCounterpartyAccountNumber()) || (transactionMessage && account.messages.find(message => transactionMessage.includes(message)));
        });

        return account ? account.id : null;
    }

    getCategory() {
        const message = this.transaction.getMessage();

        if (!message) {
            return null;
        }

        const lowerCasedMessage = message.toLowerCase();

        const category = this.categoryList.find(category => lowerCasedMessage.includes(category.name.toLowerCase()));

        return category ? category.id : null;
    }

    convert() {
        return new MoneyWizTransaction({
            amount: this.transaction.getAmount(),
            originalAmount: this.transaction.getOriginalAmount(),
            currency: this.transaction.getCurrency(),
            transferTo: this.getTransferAccount(),
            date: this.transaction.getCreatedDate(),
            description: `${this.transaction.data.type ? `${this.transaction.data.type}: ` : ''}${this.transaction.getMessage()}`,
            payee: this.getPayee(),
            category: this.getCategory(),
        });
    }
}

module.exports = MoneyWizConvertor;
