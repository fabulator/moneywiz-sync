const { payeeList, transferList, categoryList } = require('./settings');
const MoneyWizConvertor = require('./Convertor/MoneyWizConvertor');

function convert(transaction) {
    const moneyWizConvertor = new MoneyWizConvertor(transaction, payeeList, transferList, categoryList);
    return moneyWizConvertor.convert();
}

module.exports = convert;
