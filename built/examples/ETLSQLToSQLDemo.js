"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MySQLDriverImpl_1 = require("../lib/etl/impl/MySQLDriverImpl");
const PostgreSQLDriverImpl_1 = require("../lib/etl/impl/PostgreSQLDriverImpl");
const mysql_js_1 = require("./config/mysql.js");
const postgres_js_1 = require("./config/postgres.js");
const ETLTask_1 = require("../lib/ETLTask");
const ETLExecutor_1 = require("../lib/ETLExecutor");
const mySQLDriver = new MySQLDriverImpl_1.default(mysql_js_1.default);
const postgreSQLDriver = new PostgreSQLDriverImpl_1.default(postgres_js_1.default);
(async function () {
    ETLExecutor_1.default.startup(mySQLDriver, postgreSQLDriver);
    console.time('ETL');
    const createTimeDim = mySQLDriver.createTimeDimensionTable("dTime").then(() => console.log('Created Time Dim'));
    const createDateDim = mySQLDriver.createDateDimensionTable("dDate", new Date("1996-01-01"), new Date("1998-12-31")).then(() => console.log('Created Date Dim'));
    const createProductDim = mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS dProduct 
                                    (ProductID BIGINT NOT NULL AUTO_INCREMENT, 
                                    ProductDBID BIGINT, 
                                    ProductName VARCHAR(40), 
                                    ProductCategory VARCHAR(15), 
                                    PRIMARY KEY(ProductID))`).then(() => console.log('Created Product Dim'));
    const createEmployeeDim = mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS dEmployee 
                                    (EmployeeID BIGINT NOT NULL AUTO_INCREMENT, 
                                    EmployeeDBID BIGINT, 
                                    EmpLastName VARCHAR(20), 
                                    MngLastName VARCHAR(20), 
                                    PRIMARY KEY(EmployeeID))`).then(() => console.log('Created Employee Dim'));
    const createSupplierDim = mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS dSupplier 
                                    (SupplierID BIGINT NOT NULL AUTO_INCREMENT, 
                                    SupplierDBID BIGINT, 
                                    CompanyName VARCHAR(40), 
                                    Country VARCHAR(15), 
                                    PRIMARY KEY(SupplierID))`).then(() => console.log('Created Supplier Dim'));
    const createCustomerDim = mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS dCustomer 
                                    (CustomerID BIGINT NOT NULL AUTO_INCREMENT, 
                                    CustomerDBID CHAR(5), 
                                    CompanyName VARCHAR(40), 
                                    City VARCHAR(15), 
                                    Country VARCHAR(15), 
                                    PRIMARY KEY(CustomerID))`).then(() => console.log('Created Customer Dim'));
    Promise.all([createDateDim, createTimeDim, createCustomerDim, createEmployeeDim, createSupplierDim, createProductDim])
        .then(() => {
        const ordersFactTask = mySQLDriver.createTable(`CREATE TABLE IF NOT EXISTS cOrders 
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
                CONSTRAINT fk_date FOREIGN KEY (DateID) REFERENCES dDate(DateID))`).then(() => console.log('Created Orders Fact'));
        const productDimTask = new ETLTask_1.default(1, '<Create dProduct dimension table>')
            .fromSQLDatabase(postgreSQLDriver, 'SELECT p."ProductID" AS "ProductDBID", p."ProductName", c."CategoryName" AS "ProductCategory" FROM products p INNER JOIN categories c ON p."CategoryID" = c."CategoryID"')
            .toSQLDatabase(mySQLDriver, 'dProduct').then(() => console.log('Transfered Product Dim'))
            .then(() => console.log('Filled Product Dim'));
        const employeeDimTask = new ETLTask_1.default(2, '<Create dEmployee dimension table>')
            .fromSQLDatabase(postgreSQLDriver, 'SELECT e."EmployeeID" AS "EmployeeDBID", e."LastName" AS "EmpLastName", m."LastName" AS "MngLastName" FROM employees e LEFT JOIN employees m ON e."ReportsTo" = m."EmployeeID"')
            .toSQLDatabase(mySQLDriver, 'dEmployee').then(() => console.log('Transfered dEmployee Dim'))
            .then(() => console.log('Filled Employee Dim'));
        const supplierDimTask = new ETLTask_1.default(3, '<Create dSupplier dimension table>')
            .fromSQLDatabase(postgreSQLDriver, 'SELECT s."SupplierID" AS "SupplierDBID", s."CompanyName", s."Country" FROM suppliers s')
            .toSQLDatabase(mySQLDriver, 'dSupplier').then(() => console.log('Transfered dSupplier Dim'))
            .then(() => console.log('Filled Supplier Dim'));
        const customerDimTask = new ETLTask_1.default(4, '<Create dCustomer dimension table>')
            .fromSQLDatabase(postgreSQLDriver, 'SELECT c."CustomerID" AS "CustomerDBID", c."CompanyName", c."City", c."Country" FROM customers c')
            .toSQLDatabase(mySQLDriver, 'dCustomer').then(() => console.log('Transfered dCustomer Dim'))
            .then(() => console.log('Filled Customer Dim'));
        return Promise.all([productDimTask, employeeDimTask, customerDimTask, supplierDimTask, ordersFactTask]);
    })
        .then(() => new ETLTask_1.default(5, '<Create fact table>')
        .fromSQLDatabase(postgreSQLDriver, `SELECT p."ProductID", e."EmployeeID", s."SupplierID", c."CustomerID", o."OrderDate" , SUM(od."UnitPrice" * od."Quantity" * (1 - od."Discount")) AS "TotalPrice" 
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
        .toSQLDatabase(mySQLDriver, 'cOrders')
        .then(() => console.log('Filled Orders Fact'))).then(() => {
        mySQLDriver.closePool();
        postgreSQLDriver.closePool();
        console.timeEnd('ETL');
    });
    // new ETLExecutor().executeTasksInParralel(createDateDim, createProductDim, createEmployeeDim, createSupplierDim, createCustomerDim)
    //                 .executeTasksInParralel(createTimeDim)
    //                 .executeTasksInParralel(createOrdersFact)
    //                 //.executeTasksInParralel(productDimTask, employeeDimTask, supplierDimTask, customerDimTask)
    //                 //.executeTasksInParralel(factTableTask)
    //                 .cleanup(mySQLDriver, postgreSQLDriver);
})();
