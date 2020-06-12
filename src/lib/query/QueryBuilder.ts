import ISQLQueryBuilder from "./ISQLQueryBuilder";

export default class QueryBuilder {
    queryBuilder: ISQLQueryBuilder;
    query: string;

    constructor(queryBuilder: ISQLQueryBuilder) {
        this.queryBuilder = queryBuilder;
    }

    build(): string {
        return this.query;
    }

    conjunction(): QueryBuilder {
        this.query = this.queryBuilder.conjunction(this.query);

        return this;
    }

    disjunction(): QueryBuilder {
        this.query = this.queryBuilder.disjunction(this.query);

        return this;
    }

    filterEqual(field: string, value: string): QueryBuilder {
        this.query = this.queryBuilder.filterEqual(this.query, field, value);

        return this;
    }

    filterGreaterThan(field: string, value: number): QueryBuilder {
        this.query = this.queryBuilder.filterGreaterThan(this.query, field, value);

        return this;
    }

    filterGreaterThanOrEqualTo(field: string, value: number): QueryBuilder {
        this.query = this.queryBuilder.filterGreaterThanOrEqualTo(this.query, field, value);

        return this;
    }

    filterNotEqual(field: string, value: string): QueryBuilder {
        this.query = this.queryBuilder.filterNotEqual(this.query, field, value);

        return this;
    }

    filterLessThan(field: string, value: number): QueryBuilder {
        this.query = this.queryBuilder.filterLessThan(this.query, field, value);

        return this;
    }

    filterLessThanOrEqualTo(field: string, value: number): QueryBuilder {
        this.query = this.queryBuilder.filterLessThanOrEqualTo(this.query, field, value);

        return this;
    }

    selectQueryWithTable(table: string): QueryBuilder {
        this.query = this.queryBuilder.selectQueryWithTable(table);
        
        return this;
    }

    selectQueryWithTableAndFields(table: string, fields: string[]): QueryBuilder {
        this.query = this.queryBuilder.selectQueryWithTableAndFields(table, fields);
        
        return this;
    }

    where(): QueryBuilder {
        this.query = this.queryBuilder.where(this.query);

        return this;
    }
};