import PostgreSQLDriver from '../../../lib/driver/impl/PostgreSQLDriverImpl';

import pgsqlConfig from '../../config/postgres.js';

const postgreSQLDriver = new PostgreSQLDriver(pgsqlConfig);

postgreSQLDriver.createPool();

const connections = {
    postgresql: postgreSQLDriver
};

export default connections;