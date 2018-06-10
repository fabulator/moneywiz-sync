const { Database } = require('sqlite3');

class SqlLiteDatabase {
    constructor(file) {
        this.db = new Database(file);
    }

    callDb(action, ...query) {
        return new Promise((resolve, reject) => {
            this.db[action](...query, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(results);
            })
        });
    }

    run(...query) {
        return this.callDb('run', ...query);
    };

    get(...query) {
        return this.callDb('get', ...query);
    };

    all(...query) {
        return this.callDb('all', ...query);
    };

    exec(...query) {
        return this.callDb('exec', ...query);
    };

    prepare(...query) {
        return this.callDb('prepare', ...query);
    };
}

module.exports = SqlLiteDatabase;
