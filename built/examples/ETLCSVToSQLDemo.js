"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ETLTask_1 = require("../lib/ETLTask");
const MySQLDriverImpl_1 = require("../lib/etl/impl/MySQLDriverImpl");
const path = require("path");
const mysql_js_1 = require("./config/mysql.js");
const mySQLDriver = new MySQLDriverImpl_1.default(mysql_js_1.default);
(async () => {
    try {
        mySQLDriver.createPool();
        await mySQLDriver.executeQuery('CREATE TABLE IF NOT EXISTS territory (TerritoryID BIGINT NOT NULL AUTO_INCREMENT, TerritoryDBID BIGINT, TerritoryDescription VARCHAR(40), RegionID INT, PRIMARY KEY(TerritoryID))');
        await new ETLTask_1.default(1, '<Move data from CSV to MySQL>').fromCSVFile(path.resolve(__dirname, './files/territories.csv'), 'utf-8').toUpperCase("TerritoryDescription").renameAttributes({ "TerritoryID": "TerritoryDBID" }).toSQLDatabase(mySQLDriver, "territory");
    }
    catch (error) {
        console.log(error);
    }
})();
