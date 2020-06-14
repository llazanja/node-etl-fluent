import MySQLDriver from '../lib/etl/impl/MySQLDriverImpl';

import mysqlConfig from './config/mysql.js';

const mySQLDriver = new MySQLDriver(mysqlConfig);

(async () => {
    try {
        mySQLDriver.createPool();

        await mySQLDriver.scdUpdate('dCustomer', '<INSERT_QUERY>', '<UPDATE_QUERY>');
    } catch (error) {
        console.log(error);
    }
})();