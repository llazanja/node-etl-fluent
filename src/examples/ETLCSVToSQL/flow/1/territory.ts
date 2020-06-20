import connections from '../../global/Connections';

export default function createTerritoryTable() {
    return connections.mysql.createTable(
        `CREATE TABLE IF NOT EXISTS territory 
            (TerritoryID BIGINT NOT NULL AUTO_INCREMENT, 
            TerritoryDBID BIGINT,
            TerritoryDescription VARCHAR(40),
            RegionID INT,
            PRIMARY KEY(TerritoryID))`
    );
};