import MySQLDriver from '../../lib/driver/impl/MySQLDriverImpl';
import MSSQLDriver from '../../lib/driver/impl/MSSQLDriverImpl';

import mysqlConfig from '../config/mysql.js';
import mssqlConfig from '../config/mssql.js';

import { TableInfo, TableInfoTuple } from '../../lib/tcfc/TableInfo';
import { tcfc } from '../../lib/tcfc/TCFC';

async function exampleTCFC() {
    const mySQLDriver = new MySQLDriver(mysqlConfig);
    const msSQLDriver = new MSSQLDriver(mssqlConfig);

    const srcOrdersTableInfo = new TableInfo(
        msSQLDriver,
        'orders_order_details',
        'FROM orders JOIN orderItems ON orders.OrderID = orderItems.OrderID JOIN products ON orderItems.ProductID = products.ProductID ',
        ['orderItems.ProductID', 'EmployeeID', 'CustomerID'],
        'RecordCount'
    );
    const destOrdersTableInfo = new TableInfo(
        mySQLDriver,
        'cOrders',
        'FROM cOrders JOIN dCustomer ON cOrders.CustomerID = dCustomer.CustomerID',
        ['ProductID', 'EmployeeID', 'CustomerDBID'],
        'RecordCount'
    );
    const srcCustomerTableInfo = new TableInfo(
        msSQLDriver,
        'customers',
        'FROM customers',
        ['CustomerID', 'CompanyName'],
        'RecordCount'
    );
    const destCustomerTableInfo = new TableInfo(
        mySQLDriver,
        'dCustomer',
        'FROM dCustomer',
        ['CustomerDBID', 'CompanyName'],
        'RecordCount'
    );

    mySQLDriver.createPool();
    await msSQLDriver.createPool();

    await tcfc(
        [
            new TableInfoTuple(srcOrdersTableInfo, destOrdersTableInfo),
            new TableInfoTuple(srcCustomerTableInfo, destCustomerTableInfo),
        ],
        2,
        20000
    );

    await mySQLDriver.closePool();
    await msSQLDriver.closePool();
};

(async () => {
    await exampleTCFC();
})();