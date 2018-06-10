const { DateTime } = require('luxon');
const XLSX = require('xlsx');

class ZonkyWorkBook {
    constructor(buffer) {
        this.data = XLSX.read(buffer, { type: 'buffer' });
    }

    getTransaction(row) {
        const { all } = this.data.Sheets;

        if (!all[`A${row}`]) {
            return null;
        }

        const principalColumn = all[`E${row}`];
        const interestColumn = all[`F${row}`];
        const nameOfLoan = all[`G${row}`];
        const idOfLoan = all[`I${row}`];
        const userOfLoan = all[`H${row}`];
        const linkOfLoan = all[`H${row}`];

        return {
            date: DateTime.fromFormat(all[`A${row}`].v, 'd.L.yyyy'),
            type: all[`C${row}`].v,
            amount: all[`D${row}`].v,
            principal: principalColumn ? principalColumn.v : null,
            interest: interestColumn ? interestColumn.v : null,
            loan: nameOfLoan ? {
                name: nameOfLoan.v,
                id: idOfLoan.v,
                user: userOfLoan.v,
                link: linkOfLoan.v,
            } : null,
        };
    }

    getTransactions(row = 10) {
        const transaction = this.getTransaction(row);

        if (!transaction) {
            return [];
        }

        return [
            this.getTransaction(row),
            ...this.getTransactions(row + 1),
        ];
    }
}

module.exports = ZonkyWorkBook;
