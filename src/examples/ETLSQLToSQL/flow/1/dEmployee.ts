import { connections } from '../../global/Connections';

export default function createDEmployeeTable() {
    connections.mysql.createTable(
        `CREATE TABLE IF NOT EXISTS dEmployee 
            (EmployeeID BIGINT NOT NULL AUTO_INCREMENT, 
            EmployeeDBID BIGINT, 
            EmpLastName VARCHAR(20), 
            MngLastName VARCHAR(20), 
            PRIMARY KEY(EmployeeID))`);
};