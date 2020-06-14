import connections from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

const supplierDimTask = new ETLTask(3, '<Create dSupplier dimension table>')
    .fromSQLDatabase(connections.postgresql, 'SELECT s."SupplierID" AS "SupplierDBID", s."CompanyName", s."Country" FROM suppliers s')
    .toSQLDatabase(connections.mysql, 'dSupplier')
    .then(() => console.log('Loaded dSupplier'))

export default supplierDimTask;