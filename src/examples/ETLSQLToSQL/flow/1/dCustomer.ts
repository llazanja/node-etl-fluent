import { connections } from '../../global/Connections';

export default function createDCustomerTable() {
    return connections.postgresql.createTable(
        `CREATE TABLE IF NOT EXISTS "dCustomer"
            ("CustomerID" SERIAL,
            "CustomerDBID" CHAR(5),
            "CompanyName" VARCHAR(40), 
            "City" VARCHAR(15),
            "Country" VARCHAR(15),
            "ValidFrom" DATE,
            "ValidUntil" DATE,
            "Active" CHAR(1),
            PRIMARY KEY("CustomerID"))`);
};