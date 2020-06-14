import connections from '../../global/Connections';

const createEmployeeDim = connections.mysql.createTable(
    `CREATE TABLE IF NOT EXISTS dEmployee 
        (EmployeeID BIGINT NOT NULL AUTO_INCREMENT, 
        EmployeeDBID BIGINT, 
        EmpLastName VARCHAR(20), 
        MngLastName VARCHAR(20), 
        PRIMARY KEY(EmployeeID))`)
    .then(() => console.log('Created Employee Dim'));

export default createEmployeeDim;