import MongoDBDriver from '../lib/driver/impl/MongoDBDriverImpl';
import MySQLDriver from '../lib/driver/impl/MySQLDriverImpl';
import ETLTask from '../lib/ETLTask';

import mysqlConfig from './config/mysql.js';
import logger from 'Logger';

const mySQLDriver = new MySQLDriver(mysqlConfig);

const mongoDBDriver = new MongoDBDriver('mongodb://127.0.0.1:27017/game-of-thrones');

(async () => {
    try {
        await mongoDBDriver.createPool();
        mySQLDriver.createPool();

        await mySQLDriver.executeQuery('CREATE TABLE IF NOT EXISTS characters (CharacterID BIGINT NOT NULL AUTO_INCREMENT, CharacterDBID CHAR(24), name VARCHAR(40), PRIMARY KEY(CharacterID))');
        
        await new ETLTask().fromNoSQLDatabase(mongoDBDriver, 'characters', {}).toUpperCase("name").renameAttributes({ "_id": "CharacterDBID" }).toSQLDatabase(mySQLDriver, "characters");

        await mongoDBDriver.closePool();
        mySQLDriver.closePool();
    } catch (error) {
        logger.error(error);
    }
})();