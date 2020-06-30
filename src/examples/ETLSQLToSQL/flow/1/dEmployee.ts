import { connections } from '../../global/Connections';

export default function createDEmployeeTable() {
    connections.postgresql.createTable(
        `CREATE TABLE IF NOT EXISTS "dEmployee" 
            ("EmployeeID" SERIAL, 
            "EmployeeDBID" INT, 
            "EmpLastName" VARCHAR(20), 
            "MngLastName" VARCHAR(20), 
            PRIMARY KEY("EmployeeID"))`);
};