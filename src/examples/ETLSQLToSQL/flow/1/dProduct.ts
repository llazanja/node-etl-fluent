import connections from '../../global/Connections';

export default function createDProductTable() {
    return connections.mysql.createTable(
        `CREATE TABLE IF NOT EXISTS dProduct 
            (ProductID BIGINT NOT NULL AUTO_INCREMENT, 
            ProductDBID BIGINT, 
            ProductName VARCHAR(40), 
            ProductCategory VARCHAR(15), 
            PRIMARY KEY(ProductID))`);
};