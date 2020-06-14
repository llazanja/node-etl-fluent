import connections from '../../global/Connections';

const createSupplierDim = connections.mysql.createTable(
    `CREATE TABLE IF NOT EXISTS dSupplier 
        (SupplierID BIGINT NOT NULL AUTO_INCREMENT, 
        SupplierDBID BIGINT, 
        CompanyName VARCHAR(40), 
        Country VARCHAR(15), 
        PRIMARY KEY(SupplierID))`)
    .then(() => console.log('Created Supplier Dim'));

export default createSupplierDim;