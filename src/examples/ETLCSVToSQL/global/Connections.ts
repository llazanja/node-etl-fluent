import MySQLDriver from '../../../lib/driver/impl/MySQLDriverImpl';
import PostgreSQLDriver from '../../../lib/driver/impl/PostgreSQLDriverImpl';

import mysqlConfig from '../../config/mysql.js';
import pgsqlConfig from '../../config/postgres.js';

const mySQLDriver = new MySQLDriver(mysqlConfig);
const postgreSQLDriver = new PostgreSQLDriver(pgsqlConfig);

mySQLDriver.createPool();
postgreSQLDriver.createPool();

const connections = {
    mysql: mySQLDriver,
    postgresql: postgreSQLDriver
};

export default connections;