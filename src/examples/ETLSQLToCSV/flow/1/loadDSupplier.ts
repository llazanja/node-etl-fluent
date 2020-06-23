import connections from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

export default function loadDSupplierTable() {
    return new ETLTask()
    .fromSQLDatabase(connections.postgresql, 'SELECT s."SupplierID" AS "SupplierDBID", s."CompanyName", s."Country" FROM suppliers s')
    .toCSVFile('/home/viserion/Desktop/projects/diplomski/nodETL/built/examples/files/dSupplier.csv', 'UTF-8');
};