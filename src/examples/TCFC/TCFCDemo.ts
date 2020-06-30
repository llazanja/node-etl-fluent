import PostgreSQLDriver from '../../lib/driver/impl/PostgreSQLDriverImpl';
import MSSQLDriver from '../../lib/driver/impl/MSSQLDriverImpl';

import postgresqlConfig from '../config/postgres.js';
import mssqlConfig from '../config/mssql.js';

import { TableInfo, TableInfoTuple } from '../../lib/tcfc/TableInfo';
import { tcfc } from '../../lib/tcfc/TCFC';

async function exampleTCFC() {
    const postgreSQLDriver = new PostgreSQLDriver(postgresqlConfig);
    const msSQLDriver = new MSSQLDriver(mssqlConfig);
    console.time('TCFC');
    const srcOrdersTableInfo = new TableInfo(
        msSQLDriver,
        'orders_order_details',
        'FROM orders JOIN orderItems ON orders.OrderID = orderItems.OrderID JOIN products ON orderItems.ProductID = products.ProductID ',
        ['orderItems.ProductID', 'EmployeeID', 'CustomerID'],
        'RecordCount'
    );
    const destOrdersTableInfo = new TableInfo(
        postgreSQLDriver,
        'cOrders',
        `FROM "cOrders" 
            JOIN "dCustomer" ON "cOrders"."CustomerID" = "dCustomer"."CustomerID"
            JOIN "dProduct" ON "cOrders"."ProductID" = "dProduct"."ProductID"
            JOIN "dEmployee" ON "cOrders"."EmployeeID" = "dEmployee"."EmployeeID"`,
        ['"ProductDBID"', '"EmployeeDBID"', '"CustomerDBID"'],
        '"RecordCount"'
    );
    const srcCustomerTableInfo = new TableInfo(
        msSQLDriver,
        'customers',
        'FROM customers',
        ['CustomerID', 'CompanyName'],
        'RecordCount'
    );
    const destCustomerTableInfo = new TableInfo(
        postgreSQLDriver,
        'dCustomer',
        'FROM "dCustomer"',
        ['"CustomerDBID"', '"CompanyName"'],
        '"RecordCount"'
    );

    postgreSQLDriver.createPool();
    await msSQLDriver.createPool();

    await tcfc(
        [
            new TableInfoTuple(srcOrdersTableInfo, destOrdersTableInfo),
            new TableInfoTuple(srcCustomerTableInfo, destCustomerTableInfo),
        ],
        2,
        50000
    );

    await postgreSQLDriver.closePool();
    await msSQLDriver.closePool();

    console.timeEnd('TCFC');
};

(async () => {
    await exampleTCFC();
})();