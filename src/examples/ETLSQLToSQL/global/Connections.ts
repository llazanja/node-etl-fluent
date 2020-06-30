import PostgreSQLDriver from '../../../lib/driver/impl/PostgreSQLDriverImpl';
import MSSQLDriver from '../../../lib/driver/impl/MSSQLDriverImpl';

import postgreSQLConfig from '../../config/postgres.js';
import mssqlConfig from '../../config/mssql.js';

const postgreSQLDriver = new PostgreSQLDriver(postgreSQLConfig);
const msSQLDriver = new MSSQLDriver(mssqlConfig);

export const connections = {
    postgresql: postgreSQLDriver,
    mssql: msSQLDriver
};

export async function initConnections() {
    postgreSQLDriver.createPool();
    await msSQLDriver.createPool();
}