import { connections } from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';

export default function loadCSVDataToTerritory() {
    return new ETLTask()
    .fromNoSQLDatabase(connections.mongodb, 'characters', {})
    .toUpperCase("name")
    .renameAttributes({ "_id": "CharacterDBID" })
    .toSQLDatabase(connections.mysql, "characters");
};