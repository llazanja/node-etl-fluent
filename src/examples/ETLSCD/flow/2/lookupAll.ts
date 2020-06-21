import connections from '../../global/Connections';
import logger from '../../../../Logger';

export default async function lookupAll() {
    const results = await connections.mysql.lookupAll(`SELECT * FROM dCustomer WHERE CustomerDBID = 'ALFKI'`);

    logger.info(JSON.stringify(results));
};