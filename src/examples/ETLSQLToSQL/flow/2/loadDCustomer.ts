import connections from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

export default function loadDCustomerTable() {
    return new ETLTask()
    .fromSQLDatabase(connections.postgresql, 'SELECT c."CustomerID" AS "CustomerDBID", c."CompanyName", c."City", c."Country", EXTRACT(YEAR FROM NOW()) || \'-\' || EXTRACT(MONTH FROM NOW()) || \'-\' || EXTRACT(DAY FROM NOW()) AS "ValidFrom", NULL AS "ValidUntil", \'Y\' AS "Active" FROM customers c')
    .toSQLDatabase(connections.mysql, 'dCustomer');
};