import connections from '../../global/Connections';

export default function createDProductTable() {
    return connections.postgresql.createTable(
        `CREATE TABLE IF NOT EXISTS "dProduct" 
            ("ProductID" SERIAL, 
            "ProductDBID" BIGINT, 
            "ProductName" VARCHAR(40), 
            "ProductCategory" VARCHAR(15), 
            PRIMARY KEY("ProductID"))`);
};