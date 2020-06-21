import connections from '../../global/Connections';

export default function scdUpdate() {
    return connections.mysql.scdUpdate(
        `UPDATE dCustomer SET Active = 'N', ValidUntil = CAST(NOW() - INTERVAL 1 DAY AS DATE) WHERE CustomerDBID = 'ALFKI'`,
        `INSERT INTO dCustomer (CustomerDBID, CompanyName, City, Country, ValidFrom, ValidUntil, Active)
        VALUES ('ALFKI', 'Alfreds Futterkiste', 'Zagreb', 'Croatia', CAST(NOW() AS DATE), NULL, 'Y')`);
};