import connections from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

const employeeDimTask = new ETLTask(2, '<Create dEmployee dimension table>')
    .fromSQLDatabase(connections.postgresql, 'SELECT e."EmployeeID" AS "EmployeeDBID", e."LastName" AS "EmpLastName", m."LastName" AS "MngLastName" FROM employees e LEFT JOIN employees m ON e."ReportsTo" = m."EmployeeID"')
    .toSQLDatabase(connections.mysql, 'dEmployee')
    .then(() => console.log('Loaded dEmployee'));

export default employeeDimTask;