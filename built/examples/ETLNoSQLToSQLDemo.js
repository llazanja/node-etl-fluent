"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoDBDriverImpl_1 = require("../lib/etl/impl/MongoDBDriverImpl");
const MySQLDriverImpl_1 = require("../lib/etl/impl/MySQLDriverImpl");
const ETLTask_1 = require("../lib/ETLTask");
const mysql_js_1 = require("./config/mysql.js");
const mySQLDriver = new MySQLDriverImpl_1.default(mysql_js_1.default);
const mongoDBDriver = new MongoDBDriverImpl_1.default('mongodb://127.0.0.1:27017/game-of-thrones');
(async () => {
    try {
        await mongoDBDriver.createPool();
        mySQLDriver.createPool();
        await mySQLDriver.executeQuery('CREATE TABLE IF NOT EXISTS characters (CharacterID BIGINT NOT NULL AUTO_INCREMENT, CharacterDBID CHAR(24), name VARCHAR(40), PRIMARY KEY(CharacterID))');
        await new ETLTask_1.default(1, '<Move data from Mongo to MySQL>').fromNoSQLDatabase(mongoDBDriver, 'characters', {}).toUpperCase("name").renameAttributes({ "_id": "CharacterDBID" }).toSQLDatabase(mySQLDriver, "characters");
        //await mongoDBDriver.closePool();
    }
    catch (error) {
        console.log(error);
    }
})();
