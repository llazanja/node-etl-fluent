import MongoDBDriver from '../lib/etl/impl/MongoDBDriverImpl';
import MySQLDriver from '../lib/etl/impl/MySQLDriverImpl';
import ETLTask from '../lib/ETLTask';

import mysqlConfig from './config/mysql.js';

const mySQLDriver = new MySQLDriver(mysqlConfig);

const mongoDBDriver = new MongoDBDriver('mongodb://127.0.0.1:27017/game-of-thrones');

(async () => {
    try {
        await mongoDBDriver.createPool();
        mySQLDriver.createPool();

        await mySQLDriver.executeQuery('CREATE TABLE IF NOT EXISTS characters (CharacterID BIGINT NOT NULL AUTO_INCREMENT, CharacterDBID CHAR(24), name VARCHAR(40), PRIMARY KEY(CharacterID))');
        
        await new ETLTask(1, '<Move data from Mongo to MySQL>').fromNoSQLDatabase(mongoDBDriver, 'characters', {}).toUpperCase("name").renameAttributes({ "_id": "CharacterDBID" }).toSQLDatabase(mySQLDriver, "characters");

        //await mongoDBDriver.closePool();
    } catch (error) {
        console.log(error);
    }
})();