import { connections } from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

export default function loadDSupplierTable() {
    return new ETLTask()
    .fromSQLDatabase(connections.mssql, 'SELECT s.SupplierID AS SupplierDBID, s.CompanyName, c.Country FROM suppliers s LEFT JOIN city c ON s.CityID = c.CityID')
    .toSQLDatabase(connections.postgresql, 'dSupplier');
};