import ETLTask from '../lib/ETLTask';
import MySQLDriver from '../lib/etl/impl/MySQLDriverImpl';
import * as path from 'path';

import mysqlConfig from './config/mysql.js';

const mySQLDriver = new MySQLDriver(mysqlConfig);

(async () => {
    try {
        mySQLDriver.createPool();

        await mySQLDriver.executeQuery('CREATE TABLE IF NOT EXISTS territory (TerritoryID BIGINT NOT NULL AUTO_INCREMENT, TerritoryDBID BIGINT, TerritoryDescription VARCHAR(40), RegionID INT, PRIMARY KEY(TerritoryID))');

        await new ETLTask(1, '<Move data from CSV to MySQL>').fromCSVFile(path.resolve(__dirname, './files/territories.csv'), 'utf-8').toUpperCase("TerritoryDescription").renameAttributes({ "TerritoryID": "TerritoryDBID" }).toSQLDatabase(mySQLDriver, "territory");
    } catch (error) {
        console.log(error);
    }
})();