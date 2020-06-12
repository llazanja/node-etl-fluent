"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultSQLQueryBuilderImpl = void 0;
class DefaultSQLQueryBuilderImpl {
    conjunction(query) {
        return `${query} AND`;
    }
    disjunction(query) {
        return `${query} OR`;
    }
    filterEqual(query, field, value) {
        return `${query} ${field} = '${value}'`;
    }
    filterNotEqual(query, field, value) {
        return `${query} ${field} != '${value}'`;
    }
    filterGreaterThan(query, field, value) {
        return `${query} ${field} > ${value}`;
    }
    filterGreaterThanOrEqualTo(query, field, value) {
        return `${query} ${field} >= ${value}`;
    }
    filterLessThan(query, field, value) {
        return `${query} ${field} < ${value}`;
    }
    filterLessThanOrEqualTo(query, field, value) {
        return `${query} ${field} <= ${value}`;
    }
    selectQueryWithTableAndFields(table, fields) {
        throw new Error("Method not implemented.");
    }
    selectQueryWithTable(table) {
        return `SELECT * FROM ${table}`;
    }
    where(query) {
        return `${query} WHERE`;
    }
}
exports.DefaultSQLQueryBuilderImpl = DefaultSQLQueryBuilderImpl;
