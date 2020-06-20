import { connections, initConnections } from '../../global/Connections';

export default async function createCharactersTable() {
    await initConnections();
    
    return connections.mysql.createTable(
        `CREATE TABLE IF NOT EXISTS characters 
            (CharacterID BIGINT NOT NULL AUTO_INCREMENT, 
            CharacterDBID CHAR(24), 
            name VARCHAR(40), 
            PRIMARY KEY(CharacterID))`
    );
};