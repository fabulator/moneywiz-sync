class ZonkyTransaction {
    constructor(data) {
        this.data = data;
    }

    getTransactionId() {
        return null;
    }

    getCounterpartyAccountNumber() {
        return null;
    }

    getAmount() {
        const amount = this.data.interest || this.data.amount;
        return Math.round(amount * 100) / 100;
    }

    getOriginalAmount() {
        return this.getAmount();
    }

    getCurrency() {
        return 'CZK';
    }

    getCreatedDate() {
        return this.data.date;
    }

    getMessage() {
        return `Zonky: ${this.data.loan ? `Půjčka - ${this.data.loan.name}` : this.data.type}`;
    }
}

module.exports = ZonkyTransaction;
