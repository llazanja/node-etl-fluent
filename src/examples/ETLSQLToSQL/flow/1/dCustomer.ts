import connections from '../../global/Connections';

const task = connections.mysql.createTable(
    `CREATE TABLE IF NOT EXISTS dCustomer 
        (CustomerID BIGINT NOT NULL AUTO_INCREMENT, 
        CustomerDBID CHAR(5), 
        CompanyName VARCHAR(40), 
        City VARCHAR(15), 
        Country VARCHAR(15),
        ValidFrom DATE,
        ValidUntil DATE,
        Active CHAR(1), 
        PRIMARY KEY(CustomerID))`)
    .then(() => console.log('Created Customer Dim'));

export default task;