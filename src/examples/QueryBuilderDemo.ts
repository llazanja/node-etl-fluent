import PostgreSQLDriver from '../lib/driver/impl/PostgreSQLDriverImpl';
import QueryBuilder from '../lib/query/QueryBuilder';

const postgreSQLDriver = new PostgreSQLDriver({});

const queryBuilder = new QueryBuilder(postgreSQLDriver);

const query = queryBuilder.selectQueryWithTableAndFields('testTable', [ 'Attribute1', 'AttRiBuTe2', 'attribute3' ])
                            .join('testTable', 'tableId', 'joinTable', 'joinTableId')
                            .where()
                            .filterEqual('Attribute1', 'Value1')
                            .build();

console.log(query);