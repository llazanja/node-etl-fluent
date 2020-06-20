import connections from '../../global/Connections';
import ETLTask from '../../../../lib/ETLTask';
import QueryBuilder from '../../../../lib/query/QueryBuilder';

export default async function copyTables() {
    const tables = await connections.mysql.showTables('SHOW TABLES');
        
    const tasks = tables.map(table => {
        const selectQuery = new QueryBuilder(connections.mysql).selectQueryWithTable(table).build();

        return new ETLTask()
            .fromSQLDatabase(connections.mysql, selectQuery)
            .toSQLDatabase(connections.postgresql, table);
    });

    return Promise.all(tasks);
};