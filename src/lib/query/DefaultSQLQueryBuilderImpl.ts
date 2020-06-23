import ISQLQueryBuilder from "./ISQLQueryBuilder";

export abstract class DefaultSQLQueryBuilderImpl implements ISQLQueryBuilder {

    conjunction(query: string): string {
        return `${query} AND`;
    }

    disjunction(query: string): string {
        return `${query} OR`;
    }

    filterEqual(query: string, field: string, value: string): string {
        return `${query} ${field} = '${value}'`;
    }

    filterNotEqual(query: string, field: string, value: string): string {
        return `${query} ${field} != '${value}'`;
    }

    filterGreaterThan(query: string, field: string, value: number): string {
        return `${query} ${field} > ${value}`;
    }

    filterGreaterThanOrEqualTo(query: string, field: string, value: number): string {
        return `${query} ${field} >= ${value}`;
    }

    filterLessThan(query: string, field: string, value: number): string {
        return `${query} ${field} < ${value}`;
    }

    filterLessThanOrEqualTo(query: string, field: string, value: number): string {
        return `${query} ${field} <= ${value}`;
    }

    groupBy(query: string, attributes: string[]): string {
        query = `${query} GROUP BY `;
        attributes.reduce((prevQuery, currentAttr) => `${prevQuery} ${currentAttr}, `, query);
        query.substring(0, query.length - 2);

        return query;
    }

    join(query: string, srcTable: string, srcAttribute: string, destTable: string, destAttribute: string): string {
        return `${query} JOIN ${destTable} ON ${srcTable}.${srcAttribute} = ${destTable}.${destAttribute} `;
    }

    selectQueryWithTableAndFields(table: string, fields: string[]): string {
        throw new Error("Method not implemented.");
    }

    selectQueryWithTable(table: string): string {
        return `SELECT * FROM ${table}`;
    }

    where(query: string): string {
        return `${query} WHERE`;
    }
}