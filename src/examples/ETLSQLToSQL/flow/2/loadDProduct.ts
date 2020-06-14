import connections from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

const productDimTask = new ETLTask(1, '<Create dProduct dimension table>')
    .fromSQLDatabase(connections.postgresql, 'SELECT p."ProductID" AS "ProductDBID", p."ProductName", c."CategoryName" AS "ProductCategory" FROM products p INNER JOIN categories c ON p."CategoryID" = c."CategoryID"')
    .toSQLDatabase(connections.mysql, 'dProduct')
    .then(() => console.log('Loaded dProduct'));

export default productDimTask;