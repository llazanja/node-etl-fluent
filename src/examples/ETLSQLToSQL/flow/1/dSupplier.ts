import { connections } from '../../global/Connections';

export default function createDSupplierTable() {
    return connections.postgresql.createTable(
        `CREATE TABLE IF NOT EXISTS "dSupplier" 
            ("SupplierID" SERIAL, 
            "SupplierDBID" INT, 
            "CompanyName" VARCHAR(40), 
            "Country" VARCHAR(15), 
            PRIMARY KEY("SupplierID"))`);
};