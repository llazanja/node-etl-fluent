import { connections } from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

export default function loadCOrdersTable() {
    return new ETLTask()
    .fromSQLDatabase(
        connections.mssql,
        `SELECT p.ProductID, e.EmployeeID, s.SupplierID,
            c.CustomerID, CONVERT(VARCHAR(10), o.OrderDate, 111) AS OrderDate,
            SUM(od.UnitPrice * od.Quantity * (1 - od.Discount)) AS TotalPrice
            FROM orders o JOIN orderItems od ON o.OrderID = od.OrderID 
            JOIN products p ON od.ProductID = p.ProductID 
            JOIN suppliers s ON p.SupplierID = s.SupplierID 
            JOIN customers c ON o.CustomerID = c.CustomerID 
            JOIN employees e ON o.EmployeeID = e.EmployeeID 
            WHERE YEAR(o.OrderDate) != '2070'
            GROUP BY p.ProductID, e.EmployeeID, s.SupplierID, c.CustomerID, o.OrderDate`
    )
    .lookupAndReplace(connections.mysql, "dDate", "OrderDate", "DateID", "Date")
    .lookupAndReplace(connections.mysql, "dProduct", "ProductID", "ProductID", "ProductDBID")
    .lookupAndReplace(connections.mysql, "dEmployee", "EmployeeID", "EmployeeID", "EmployeeDBID")
    .lookupAndReplace(connections.mysql, "dSupplier", "SupplierID", "SupplierID", "SupplierDBID")
    .lookupAndReplace(connections.mysql, "dCustomer", "CustomerID", "CustomerID", "CustomerDBID")
    .toSQLDatabase(connections.mysql, 'cOrders');
};