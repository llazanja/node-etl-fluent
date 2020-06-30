import { connections } from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

export default function loadDCustomerTable() {
    return new ETLTask()
    .fromSQLDatabase(connections.mssql, "SELECT c.CustomerID AS CustomerDBID, c.CompanyName, ci.CityName AS City, ci.Country, CONVERT(VARCHAR(10), getdate(), 111) AS ValidFrom, NULL AS ValidUntil, 'Y' AS Active FROM Customers c LEFT JOIN City ci ON c.CityID = ci.CityID")
    .toSQLDatabase(connections.postgresql, 'dCustomer');
};