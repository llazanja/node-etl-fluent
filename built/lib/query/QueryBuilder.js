"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor(queryBuilder) {
        this.queryBuilder = queryBuilder;
    }
    build() {
        return this.query;
    }
    conjunction() {
        this.query = this.queryBuilder.conjunction(this.query);
        return this;
    }
    disjunction() {
        this.query = this.queryBuilder.disjunction(this.query);
        return this;
    }
    filterEqual(field, value) {
        this.query = this.queryBuilder.filterEqual(this.query, field, value);
        return this;
    }
    filterGreaterThan(field, value) {
        this.query = this.queryBuilder.filterGreaterThan(this.query, field, value);
        return this;
    }
    filterGreaterThanOrEqualTo(field, value) {
        this.query = this.queryBuilder.filterGreaterThanOrEqualTo(this.query, field, value);
        return this;
    }
    filterNotEqual(field, value) {
        this.query = this.queryBuilder.filterNotEqual(this.query, field, value);
        return this;
    }
    filterLessThan(field, value) {
        this.query = this.queryBuilder.filterLessThan(this.query, field, value);
        return this;
    }
    filterLessThanOrEqualTo(field, value) {
        this.query = this.queryBuilder.filterLessThanOrEqualTo(this.query, field, value);
        return this;
    }
    selectQueryWithTable(table) {
        this.query = this.queryBuilder.selectQueryWithTable(table);
        return this;
    }
    selectQueryWithTableAndFields(table, fields) {
        this.query = this.queryBuilder.selectQueryWithTableAndFields(table, fields);
        return this;
    }
    where() {
        this.query = this.queryBuilder.where(this.query);
        return this;
    }
}
exports.default = QueryBuilder;
;
