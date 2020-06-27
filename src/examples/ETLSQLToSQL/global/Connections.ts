import MySQLDriver from '../../../lib/driver/impl/MySQLDriverImpl';
import MSSQLDriver from '../../../lib/driver/impl/MSSQLDriverImpl';

import mysqlConfig from '../../config/mysql.js';
import mssqlConfig from '../../config/mssql.js';

const mySQLDriver = new MySQLDriver(mysqlConfig);
const msSQLDriver = new MSSQLDriver(mssqlConfig);

export const connections = {
    mysql: mySQLDriver,
    mssql: msSQLDriver
};

export async function initConnections() {
    mySQLDriver.createPool();
    await msSQLDriver.createPool();
}