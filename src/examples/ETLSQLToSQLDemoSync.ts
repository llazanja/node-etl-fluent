import MySQLDriver from '../lib/driver/impl/MySQLDriverImpl';
import PostgreSQLDriver from '../lib/driver/impl/PostgreSQLDriverImpl';

import mysqlConfig from './config/mysql.js';
import pgsqlConfig from './config/postgres.js';

import ETLTask from '../lib/ETLTask';

const mySQLDriver = new MySQLDriver(mysqlConfig);
const postgreSQLDriver = new PostgreSQLDriver(pgsqlConfig);

(async function () { 
    mySQLDriver.createPool();
    postgreSQLDriver.createPool();
    
    console.time('ETL');
    
    mySQLDriver.createDateDimensionTable("dDate", new Date("1996-01-01"), new Date("1998-12-31")).then(() => {
        return mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS dProduct 
            (ProductID BIGINT NOT NULL AUTO_INCREMENT, 
            ProductDBID BIGINT, 
            ProductName VARCHAR(40), 
            ProductCategory VARCHAR(15), 
            PRIMARY KEY(ProductID))`);
    }).then(() => 
        mySQLDriver.createTimeDimensionTable('dTime')
    )
    .then(() => {
        return mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS dEmployee 
            (EmployeeID BIGINT NOT NULL AUTO_INCREMENT, 
            EmployeeDBID BIGINT, 
            EmpLastName VARCHAR(20), 
            MngLastName VARCHAR(20), 
            PRIMARY KEY(EmployeeID))`);
    }).then(() => {
        return mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS dSupplier 
            (SupplierID BIGINT NOT NULL AUTO_INCREMENT, 
            SupplierDBID BIGINT, 
            CompanyName VARCHAR(40), 
            Country VARCHAR(15), 
            PRIMARY KEY(SupplierID))`);
    }).then(() => {
        return mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS dCustomer 
            (CustomerID BIGINT NOT NULL AUTO_INCREMENT, 
            CustomerDBID CHAR(5), 
            CompanyName VARCHAR(40), 
            City VARCHAR(15), 
            Country VARCHAR(15), 
            PRIMARY KEY(CustomerID))`);
    }).then(() => {
        return mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS cOrders 
            (ProductID BIGINT, 
            EmployeeID BIGINT, 
            SupplierID BIGINT, 
            CustomerID BIGINT, 
            DateID BIGINT UNSIGNED, 
            TotalPrice INT NOT NULL, 
            PRIMARY KEY(ProductID, EmployeeID, SupplierID, CustomerID, DateID),
            CONSTRAINT fk_product FOREIGN KEY (ProductID) REFERENCES dProduct(ProductID),
            CONSTRAINT fk_employee FOREIGN KEY (EmployeeID) REFERENCES dEmployee(EmployeeID),
            CONSTRAINT fk_supplier FOREIGN KEY (SupplierID) REFERENCES dSupplier(SupplierID),
            CONSTRAINT fk_customer FOREIGN KEY (CustomerID) REFERENCES dCustomer(CustomerID),
            CONSTRAINT fk_date FOREIGN KEY (DateID) REFERENCES dDate(DateID))`);
    }).then(() => {
        return new ETLTask()
        .fromSQLDatabase(postgreSQLDriver, 'SELECT p."ProductID" AS "ProductDBID", p."ProductName", c."CategoryName" AS "ProductCategory" FROM products p INNER JOIN categories c ON p."CategoryID" = c."CategoryID"')
        .toSQLDatabase(mySQLDriver, 'dProduct');
    }).then(() => {
        return new ETLTask()
        .fromSQLDatabase(postgreSQLDriver, 'SELECT e."EmployeeID" AS "EmployeeDBID", e."LastName" AS "EmpLastName", m."LastName" AS "MngLastName" FROM employees e LEFT JOIN employees m ON e."ReportsTo" = m."EmployeeID"')
        .toSQLDatabase(mySQLDriver, 'dEmployee');
    }).then(() => {
        return new ETLTask()
        .fromSQLDatabase(postgreSQLDriver, 'SELECT s."SupplierID" AS "SupplierDBID", s."CompanyName", s."Country" FROM suppliers s')
        .toSQLDatabase(mySQLDriver, 'dSupplier');
    }).then(() => {
        return new ETLTask()
        .fromSQLDatabase(postgreSQLDriver, 'SELECT c."CustomerID" AS "CustomerDBID", c."CompanyName", c."City", c."Country" FROM customers c')
        .toSQLDatabase(mySQLDriver, 'dCustomer');
    }).then(() => {
        return new ETLTask().fromSQLDatabase(postgreSQLDriver, `SELECT p."ProductID", e."EmployeeID", s."SupplierID", c."CustomerID", o."OrderDate" , SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")) AS "TotalPrice" 
                FROM orders o JOIN order_details od ON o."OrderID" = od."OrderID" 
                JOIN products p ON od."ProductID" = p."ProductID" 
                JOIN suppliers s ON p."SupplierID" = s."SupplierID" 
                JOIN customers c ON o."CustomerID" = c."CustomerID" 
                JOIN employees e ON o."EmployeeID" = e."EmployeeID" 
                GROUP BY p."ProductID", e."EmployeeID", s."SupplierID", c."CustomerID", o."OrderDate"`)
        .lookupAndReplace(mySQLDriver, "dDate", "OrderDate", "DateID", "Date")
        .lookupAndReplace(mySQLDriver, "dProduct", "ProductID", "ProductID", "ProductDBID")
        .lookupAndReplace(mySQLDriver, "dEmployee", "EmployeeID", "EmployeeID", "EmployeeDBID")
        .lookupAndReplace(mySQLDriver, "dSupplier", "SupplierID", "SupplierID", "SupplierDBID")
        .lookupAndReplace(mySQLDriver, "dCustomer", "CustomerID", "CustomerID", "CustomerDBID")
        .toSQLDatabase(mySQLDriver, 'cOrders');

    }).then(() => {
        console.timeEnd('ETL');
        mySQLDriver.closePool();
        postgreSQLDriver.closePool();
    });
})();
