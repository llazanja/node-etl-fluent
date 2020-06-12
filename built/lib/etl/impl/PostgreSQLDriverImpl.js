"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pgpromise = require("pg-promise");
const pgp = pgpromise();
const QueryStream = require("pg-query-stream");
const DefaultSQLQueryBuilderImpl_1 = require("../../query/DefaultSQLQueryBuilderImpl");
const DateUtil_1 = require("../../util/DateUtil");
const TimeUtil_1 = require("../../util/TimeUtil");
class PostgreSQLDriver extends DefaultSQLQueryBuilderImpl_1.DefaultSQLQueryBuilderImpl {
    constructor(config) {
        super();
        this.config = config;
    }
    closePool() {
        console.log('Destroying PostgreSQL Pool');
        this.connectionPool.$pool.end();
    }
    createPool() {
        console.log('Creating PostgreSQL Pool');
        this.connectionPool = pgp(this.config);
    }
    async executeQuery(query) {
        const queryStream = new QueryStream(query);
        return new Promise(resolve => {
            this.connectionPool.stream(queryStream, (stream => {
                resolve(stream);
            }));
        });
    }
    filterEqual(query, field, value) {
        return `${query} "${field}" = '${value}'`;
    }
    filterNotEqual(query, field, value) {
        return `${query} "${field}" != '${value}'`;
    }
    filterGreaterThan(query, field, value) {
        return `${query} "${field}" > ${value}`;
    }
    filterGreaterThanOrEqualTo(query, field, value) {
        return `${query} "${field}" >= ${value}`;
    }
    filterLessThan(query, field, value) {
        return `${query} "${field}" < ${value}`;
    }
    filterLessThanOrEqualTo(query, field, value) {
        return `${query} "${field}" <= ${value}`;
    }
    selectQueryWithTableAndFields(table, fields) {
        let query = 'SELECT';
        query = fields.reduce((query, field) => `${query} "${field}",`, query);
        query = query.substring(0, query.length - 1);
        query = `${query} FROM ${table}`;
        return query;
    }
    async showTables(query) {
        const result = await this.connectionPool.query(query);
        return result.rows.map((row) => row.table_name);
    }
    async createDateDimensionTable(table, dateFrom, dateTo) {
        if (dateFrom >= dateTo) {
            throw new Error("dateTo must be larger than dateFrom!");
        }
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} ("TimeId" SERIAL, "Type" VARCHAR(15), "Date" DATE, "Year" INT, "Quarter" INT, "Month" INT, "Day" INT, "DayOfWeek" INT, "DayOfWeekName" VARCHAR(15), "MonthName" VARCHAR(15))`;
        await this.connectionPool.query(createTableQuery);
        const queryArr = [];
        let unkownTypeInsertQuery = `INSERT INTO ${table} ("Type") VALUES ('Unknown')`;
        queryArr.push(this.connectionPool.query(unkownTypeInsertQuery));
        let notApplicableTypeInsertQuery = `INSERT INTO ${table} ("Type") VALUES ('Not applicable')`;
        queryArr.push(this.connectionPool.query(notApplicableTypeInsertQuery));
        for (let currentDate = dateFrom; currentDate <= dateTo; currentDate.setDate(currentDate.getDate() + 1)) {
            let insertQuery = `INSERT INTO ${table} ("Type", "Date", "Year", "Quarter", "Month", "Day", "DayOfWeek", "DayOfWeekName", "MonthName") VALUES ('Date', '${DateUtil_1.getDate(currentDate)}', ${currentDate.getFullYear()}, ${DateUtil_1.getQuarter(currentDate)}, ${currentDate.getUTCMonth() + 1}, ${currentDate.getUTCDate()}, ${currentDate.getUTCDay()}, '${DateUtil_1.dayOfWeekNumberToName(currentDate.getUTCDay())}', '${DateUtil_1.monthNumberToName(currentDate.getUTCMonth())}')`;
            queryArr.push(this.connectionPool.query(insertQuery));
        }
        return Promise.all(queryArr);
    }
    async createTimeDimensionTable(table) {
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} ("TimeID" SERIAL, "Type" VARCHAR(15), "Time" TIME, "SecondsAfterMidnight" INT, "MinutesAfterMidnight" INT, "Seconds" INT, "Minutes" INT, "Hour" INT, "Period" VARCHAR(15))`;
        await this.connectionPool.query(createTableQuery);
        const queryArr = [];
        let unkownTypeInsertQuery = `INSERT INTO ${table} ("Type") VALUES ('Unknown')`;
        queryArr.push(this.connectionPool.query(unkownTypeInsertQuery));
        let notApplicableTypeInsertQuery = `INSERT INTO ${table} ("Type") VALUES ('Not applicable')`;
        queryArr.push(this.connectionPool.query(notApplicableTypeInsertQuery));
        for (let currentDate = new Date('December 25, 1995 00:00:00'), endDate = new Date('December 25, 1995 23:59:59'); currentDate <= endDate; currentDate.setSeconds(currentDate.getSeconds() + 1)) {
            let insertQuery = `INSERT INTO ${table} ("Type", "Time", "SecondsAfterMidnight", "MinutesAfterMidnight", "Seconds", "Minutes", "Hour", "Period") VALUES ('Time', '${TimeUtil_1.getTime(currentDate)}', ${TimeUtil_1.getSecondsAfterMidnight(currentDate)}, ${TimeUtil_1.getMinutesAfterMidnight(currentDate)}, ${currentDate.getUTCSeconds()}, ${currentDate.getUTCMinutes()}, ${currentDate.getUTCHours()}, '${TimeUtil_1.getPeriod(currentDate)}')`;
            queryArr.push(this.connectionPool.query(insertQuery));
        }
        return Promise.all(queryArr);
    }
    async lookupAttribute(table, attributeToLookup, joinAttribute, joinValue) {
        const query = new pgp.ParameterizedQuery({ text: `SELECT ${attributeToLookup} AS result FROM ${table} WHERE ${joinAttribute} = $1`, values: [joinValue] });
        return this.connectionPool.one(query);
    }
    batchInsertQueryWithChunks(table, chunkArray) {
        const cs = new pgp.helpers.ColumnSet(Object.keys(chunkArray[0]), { table });
        const values = [];
        chunkArray.forEach((chunk) => {
            values.push(chunk);
        });
        console.log(values);
        const query = pgp.helpers.insert(values, cs);
        return this.connectionPool.none(query);
    }
    createTable(query) {
        return this.connectionPool.none(query);
    }
}
exports.default = PostgreSQLDriver;
;
