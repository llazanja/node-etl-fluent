import connections from '../../global/Connections';
import * as path from 'path';
import ETLTask from '../../../../lib/ETLTask';

export default function loadCSVDataToTerritory() {
    return new ETLTask()
        .fromCSVFile(path.resolve(__dirname, '../../files/territories.csv'), 'utf-8')
        .toUpperCase("TerritoryDescription")
        .renameAttributes({ "TerritoryID": "TerritoryDBID" })
        .toSQLDatabase(connections.mysql, "territory");
};