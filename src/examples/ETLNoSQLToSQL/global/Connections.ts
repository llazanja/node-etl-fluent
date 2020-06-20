import MySQLDriver from '../../../lib/driver/impl/MySQLDriverImpl';
import MongoDBDriver from '../../../lib/driver/impl/MongoDBDriverImpl';

import mysqlConfig from '../../config/mysql.js';

const mySQLDriver = new MySQLDriver(mysqlConfig);
const mongoDBDriver = new MongoDBDriver('mongodb://127.0.0.1:27017/game-of-thrones');

export const connections = {
    mysql: mySQLDriver,
    mongodb: mongoDBDriver
};

export async function initConnections() {
    mySQLDriver.createPool();
    await mongoDBDriver.createPool();
}