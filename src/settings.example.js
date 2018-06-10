const messagePayeeList = [
    { name: MESSAGE_TO_MATCH, id: PAYEE_ID },
];

const bankNumberPayeeList = [
    { bank: ACCOUNT_NUMBERS_TO_MATCH, id: PAYEE_ID },
];

const idPayeeList = [
    { transactionId: TRANSATION_ID_TO_MATCH, id: PAYEE_ID },
];

const categoryList = [
    { name: MESSAGE_TO_MATCH, id: CATEGORY_ID },
];

const transferList = [
    {
        id: ACCOUNT_ID,
        banks: [ ACCOUNT_NUMBERS_TO_MATCH ],
        messages: [ MESSAGES_TO_MATCH ],
    },
];


module.exports = {
    dbLocation: 'MONEYWIZ_DB_FILE_LOCATION',
    zonky : {
        username: 'ZONKY_USERNAME',
        password: 'ZONKY_PASSWORD',
        accountId: ZONKY_ACCOUNT_ID,
    },
    fio: [
        { accountId: FIO_ACCOUNT_ID, key: FIO_KEY },
    ],
    payeeList: {
        messagePayeeList,
        bankNumberPayeeList,
        idPayeeList,
    },
    categoryList: categoryList,
    transferList: transferList,
};
