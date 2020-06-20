import MySQLDriver from '../../lib/driver/impl/MySQLDriverImpl';
import PostgreSQLDriver from '../../lib/driver/impl/PostgreSQLDriverImpl';

import mysqlConfig from '../config/mysql.js';
import pgsqlConfig from '../config/postgres.js';

import { TableInfo, TableInfoTuple } from '../../lib/tcfc/TableInfo';
import { tcfc } from '../../lib/tcfc/TCFC';

async function exampleTCFC() {
    const mySQLDriver = new MySQLDriver(mysqlConfig);
    const postgreSQLDriver = new PostgreSQLDriver(pgsqlConfig);

    const srcOrdersTableInfo = new TableInfo(
        postgreSQLDriver,
        'orders_order_details',
        'FROM orders JOIN order_details ON orders."OrderID" = order_details."OrderID"',
        ['"ProductID"', '"EmployeeID"'],
        '"RecordCount"'
    );
    const destOrdersTableInfo = new TableInfo(
        mySQLDriver,
        'cOrders',
        'FROM cOrders',
        ['ProductID', 'EmployeeID'],
        'RecordCount'
    );
    const srcCustomerTableInfo = new TableInfo(
        postgreSQLDriver,
        'customers',
        'FROM customers',
        ['"CustomerID"', '"CompanyName"'],
        '"RecordCount"'
    );
    const destCustomerTableInfo = new TableInfo(
        mySQLDriver,
        'dCustomer',
        'FROM dCustomer',
        ['CustomerDBID', 'CompanyName'],
        'RecordCount'
    );

    mySQLDriver.createPool();
    postgreSQLDriver.createPool();

    await tcfc(
        [
            new TableInfoTuple(srcOrdersTableInfo, destOrdersTableInfo),
            new TableInfoTuple(srcCustomerTableInfo, destCustomerTableInfo),
        ],
        2,
        300000
    );

    mySQLDriver.closePool();
    postgreSQLDriver.closePool();
};

(async () => {
    await exampleTCFC();
})();