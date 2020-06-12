import ISQLDriver from '../ISQLDriver';
import { Pool } from 'pg';
import * as pgpromise from 'pg-promise';
const pgp = pgpromise();
import * as QueryStream from 'pg-query-stream';
import { Stream } from 'stream';
import { DefaultSQLQueryBuilderImpl } from '../../query/DefaultSQLQueryBuilderImpl';
import { getQuarter, getDate, monthNumberToName, dayOfWeekNumberToName } from '../../util/DateUtil';
import { getTime, getMinutesAfterMidnight, getSecondsAfterMidnight, getPeriod } from '../../util/TimeUtil';
import { IClient } from 'pg-promise/typescript/pg-subset';

export default class PostgreSQLDriver extends DefaultSQLQueryBuilderImpl implements ISQLDriver {
    config: object;
    connectionPool: pgpromise.IDatabase<Pool, IClient>;
    database: pgpromise.IDatabase<Pool, IClient>;

    constructor(config: object) {
        super();
        this.config = config;
    }

    closePool(): void {
        console.log('Destroying PostgreSQL Pool');
        this.connectionPool.$pool.end();
    }

    createPool(): void {
        console.log('Creating PostgreSQL Pool');
        this.connectionPool = pgp(this.config);
    }

    async executeQuery(query: string): Promise<Stream> {
        const queryStream = new QueryStream(query);

        return new Promise(resolve => {
            this.connectionPool.stream(queryStream, (stream => {
                resolve(stream);
            }));
        });
    }

    filterEqual(query: string, field: string, value: string): string {
        return `${query} "${field}" = '${value}'`;
    }

    filterNotEqual(query: string, field: string, value: string): string {
        return `${query} "${field}" != '${value}'`;
    }

    filterGreaterThan(query: string, field: string, value: number): string {
        return `${query} "${field}" > ${value}`;
    }

    filterGreaterThanOrEqualTo(query: string, field: string, value: number): string {
        return `${query} "${field}" >= ${value}`;
    }

    filterLessThan(query: string, field: string, value: number): string {
        return `${query} "${field}" < ${value}`;
    }

    filterLessThanOrEqualTo(query: string, field: string, value: number): string {
        return `${query} "${field}" <= ${value}`;
    }
    
    selectQueryWithTableAndFields(table: string, fields: string[]): string {
        let query = 'SELECT';
        query = fields.reduce((query, field) => `${query} "${field}",`, query);
        query = query.substring(0, query.length - 1);
        query = `${query} FROM ${table}`;
        
        return query;
    }

    async showTables(query: string): Promise<string[]> {
        const result = await this.connectionPool.query(query);

        return result.rows.map((row: any) => row.table_name);
    }

    async createDateDimensionTable(table: string, dateFrom: Date, dateTo: Date): Promise<any[]> {
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
            let insertQuery = `INSERT INTO ${table} ("Type", "Date", "Year", "Quarter", "Month", "Day", "DayOfWeek", "DayOfWeekName", "MonthName") VALUES ('Date', '${getDate(currentDate)}', ${currentDate.getFullYear()}, ${getQuarter(currentDate)}, ${currentDate.getUTCMonth() + 1}, ${currentDate.getUTCDate()}, ${currentDate.getUTCDay()}, '${dayOfWeekNumberToName(currentDate.getUTCDay())}', '${monthNumberToName(currentDate.getUTCMonth())}')`;
        
            queryArr.push(this.connectionPool.query(insertQuery));
        }
        
        return Promise.all(queryArr);
    }

    async createTimeDimensionTable(table: string): Promise<any[]> {
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} ("TimeID" SERIAL, "Type" VARCHAR(15), "Time" TIME, "SecondsAfterMidnight" INT, "MinutesAfterMidnight" INT, "Seconds" INT, "Minutes" INT, "Hour" INT, "Period" VARCHAR(15))`;
        await this.connectionPool.query(createTableQuery);

        const queryArr = [];

        let unkownTypeInsertQuery = `INSERT INTO ${table} ("Type") VALUES ('Unknown')`;
        queryArr.push(this.connectionPool.query(unkownTypeInsertQuery));

        let notApplicableTypeInsertQuery = `INSERT INTO ${table} ("Type") VALUES ('Not applicable')`;
        queryArr.push(this.connectionPool.query(notApplicableTypeInsertQuery));

        for (let currentDate = new Date('December 25, 1995 00:00:00'), endDate = new Date('December 25, 1995 23:59:59'); currentDate <= endDate; currentDate.setSeconds(currentDate.getSeconds() + 1)) {
            let insertQuery = `INSERT INTO ${table} ("Type", "Time", "SecondsAfterMidnight", "MinutesAfterMidnight", "Seconds", "Minutes", "Hour", "Period") VALUES ('Time', '${getTime(currentDate)}', ${getSecondsAfterMidnight(currentDate)}, ${getMinutesAfterMidnight(currentDate)}, ${currentDate.getUTCSeconds()}, ${currentDate.getUTCMinutes()}, ${currentDate.getUTCHours()}, '${getPeriod(currentDate)}')`;
        
            queryArr.push(this.connectionPool.query(insertQuery));
        }
        
        return Promise.all(queryArr);
    }

    async lookupAttribute(table: string, attributeToLookup: string, joinAttribute: string, joinValue: string): Promise<string> {
        const query = new pgp.ParameterizedQuery({ text: `SELECT ${attributeToLookup} AS result FROM ${table} WHERE ${joinAttribute} = $1`, values: [joinValue]})

        return this.connectionPool.one(query);
    }

    batchInsertQueryWithChunks(table: string, chunkArray: object[]): Promise<void> {
        const cs = new pgp.helpers.ColumnSet(Object.keys(chunkArray[0]), { table });
        const values: object[] = [];
        chunkArray.forEach((chunk) => {
            values.push(chunk);
        });

        console.log(values);

        const query = pgp.helpers.insert(values, cs);

        return this.connectionPool.none(query);
    }

    createTable(query: string): Promise<void> {
        return this.connectionPool.none(query);
    }
};