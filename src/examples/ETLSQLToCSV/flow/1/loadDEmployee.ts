import connections from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

export default function loadDEmployeeTable() {
    new ETLTask()
    .fromSQLDatabase(connections.postgresql, 'SELECT e."EmployeeID" AS "EmployeeDBID", e."LastName" AS "EmpLastName", m."LastName" AS "MngLastName" FROM employees e LEFT JOIN employees m ON e."ReportsTo" = m."EmployeeID"')
    .toCSVFile('/home/viserion/Desktop/projects/diplomski/nodETL/built/examples/files/dEmployee.csv', 'UTF-8');
};