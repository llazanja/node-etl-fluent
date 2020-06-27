import { connections } from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

export default function loadDEmployeeTable() {
    new ETLTask()
    .fromSQLDatabase(connections.mssql, 'SELECT e.EmployeeID AS EmployeeDBID, e.LastName AS EmpLastName, m.LastName AS MngLastName FROM employees e LEFT JOIN employees m ON e.ReportsTo = m.EmployeeID')
    .toSQLDatabase(connections.mysql, 'dEmployee');
};