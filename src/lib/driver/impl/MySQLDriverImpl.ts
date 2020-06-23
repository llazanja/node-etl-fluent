import ISQLDriver from '../ISQLDriver';
import { createPool, Pool } from 'mysql';
import { Stream } from 'stream';
import { DefaultSQLQueryBuilderImpl } from '../../query/DefaultSQLQueryBuilderImpl';
import { getQuarter, getDate, dayOfWeekNumberToName, monthNumberToName, getDateDayBefore } from '../../util/DateUtil';
import { getSecondsAfterMidnight, getMinutesAfterMidnight, getPeriod, getTime } from '../../util/TimeUtil';

export default class MySQLDriver extends DefaultSQLQueryBuilderImpl implements ISQLDriver {
    config: object;
    connectionPool: Pool;

    constructor(config: object) {
        super();
        this.config = config;
    }

    closePool(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connectionPool.end((err) => {
                if (err) {
                    reject(err);
                }

                resolve();
            });
        });
    }

    createPool(): void {
        this.connectionPool = createPool(this.config);
    }

    getStreamByQuery(query: string): Promise<Stream> {
        return Promise.resolve(this.connectionPool.query(query).stream());
    }

    join(query: string, srcTable: string, srcAttribute: string, destTable: string, destAttribute: string): string {
        return `${query} JOIN ${destTable} ON ${srcTable}.${srcAttribute} = ${destTable}.${destAttribute} `;
    }

    executeQuery(query: string): Promise<object[]> {
        return new Promise((resolve, reject) => {
            this.connectionPool.query(query, (err, results, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(results);
            });
        });
    }

    selectQueryWithTableAndFields(table: string, fields: string[]): string {
        let query = `SELECT`;
        query = fields.reduce((query, field) => `${query} ${field},`, query);
        query = query.substring(0, query.length - 1);
        query = `${query} FROM ${table}`;
    
        return query;
    }

    async showTables(query: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            this.connectionPool.query(query, (err, results, fields) => {
                if (err) {
                    return reject(err);
                }

                const tables = results.map((dataPacket: any) => Object.values(dataPacket)[0]);

                resolve(tables);
            });
        });
    }

    async createDateDimensionTable(table: string, dateFrom: Date, dateTo: Date): Promise<any[]> {
        if (dateFrom >= dateTo) {
            throw new Error("dateTo must be larger than dateFrom!");
        }

        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (DateID SERIAL, Type VARCHAR(15), Date DATE DEFAULT NULL, Year INT DEFAULT NULL, Quarter INT DEFAULT NULL, Month INT DEFAULT NULL, Day INT DEFAULT NULL, DayOfWeek INT DEFAULT NULL, DayOfWeekName VARCHAR(15) DEFAULT NULL, MonthName VARCHAR(15) DEFAULT NULL)`;
        await this.createTable(createTableQuery);

        const insertQuery = `INSERT INTO ${table} (Type, Date, Year, Quarter, Month, Day, DayOfWeek, DayOfWeekName, MonthName) VALUES ?`;

        const promises: Promise<void>[] = [];
        let values = [
            ['Unkown', null, null, null, null, null, null, null, null],
            ['Not applicable', null, null, null, null, null, null, null, null]
        ] as any;
        for (let currentDate = dateFrom; currentDate <= dateTo; currentDate.setDate(currentDate.getDate() + 1)) {
            values.push(['Date', getDate(currentDate), currentDate.getFullYear(), getQuarter(currentDate), currentDate.getMonth() + 1, currentDate.getDate() - 1, currentDate.getDay(), dayOfWeekNumberToName(currentDate.getDay()), monthNumberToName(currentDate.getMonth())]);
        
            if (values.length === 10000) {
                promises.push(new Promise((resolve, reject) => {
                    this.connectionPool.query(insertQuery, [JSON.parse(JSON.stringify(values))], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                }));
                values = [];
            }
        }

        if (values.length > 0) {
            promises.push(new Promise((resolve, reject) => {
                this.connectionPool.query(insertQuery, [JSON.parse(JSON.stringify(values))], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            }));
        }

        return Promise.all(promises);
    }

    async createTimeDimensionTable(table: string): Promise<any[]> {
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (TimeID SERIAL, Type VARCHAR(15), Time TIME, SecondsAfterMidnight INT, MinutesAfterMidnight INT, Seconds INT, Minutes INT, Hour INT, Period VARCHAR(15))`;
        await this.createTable(createTableQuery);

        const insertQuery = `INSERT INTO ${table} (Type, Time, SecondsAfterMidnight, MinutesAfterMidnight, Seconds, Minutes, Hour, Period) VALUES ?`;

        const promises: Promise<void>[] = [];
        let values = [
            ['Unkown', null, null, null, null, null, null, null],
            ['Not applicable', null, null, null, null, null, null, null]
        ] as any;
        for (let currentDate = new Date('December 25, 1995 00:00:00'), endDate = new Date('December 25, 1995 23:59:59'); currentDate <= endDate; currentDate.setSeconds(currentDate.getSeconds() + 1)) {
            values.push(['Time', getTime(currentDate), getSecondsAfterMidnight(currentDate), getMinutesAfterMidnight(currentDate), currentDate.getUTCSeconds(), currentDate.getUTCMinutes(), currentDate.getUTCHours(), getPeriod(currentDate)]);
        
            if (values.length === 10000) {
                promises.push(new Promise((resolve, reject) => {
                    this.connectionPool.query(insertQuery, [JSON.parse(JSON.stringify(values))], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                }));
                values = [];
            }
        }

        if (values.length > 0) {
            promises.push(new Promise((resolve, reject) => {
                this.connectionPool.query(insertQuery, [JSON.parse(JSON.stringify(values))], (err) => {
                    if (err) reject(err);
                    resolve();
                });
            }));
        }

        return Promise.all(promises);
    }

    async lookupAttribute(table: string, attributeToLookup: string, joinAttribute: string, joinValue: string): Promise<string> {
        let selectQuery = `SELECT ${attributeToLookup} AS result FROM ${table} WHERE ${joinAttribute} = ?`;

        return new Promise((resolve, reject) => {
            this.connectionPool.query(selectQuery, [joinValue], (error, results) => {
                if (error) {
                    reject(error);
                }
                resolve(results[0] ? results[0].result : null);
            });
        });
    }

    batchInsertQueryWithChunks(table: string, chunkArray: object[]): Promise<void> {
        let insertQuery = `INSERT INTO ${table} (`;
        insertQuery = Object.keys(chunkArray[0]).reduce((insertQuery: string, key: string) => `${insertQuery}${key}, `, insertQuery);
        insertQuery = insertQuery.substring(0, insertQuery.length - 2);
        insertQuery = `${insertQuery}) VALUES ?`;

        const values = [] as any;
        chunkArray.forEach((chunk: { [key: string]: any }) => {
            values.push(Object.values(chunk));
        });

        return new Promise((resolve, reject) => {
            this.connectionPool.query(insertQuery, [values], (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    createTable(query: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connectionPool.query(query, (err) => {
                if (err) {
                    reject(err);
                }
                
                resolve();
            });
        });
    }

    scdUpdate(updateQuery: string, insertQuery: string): Promise<void[]> {       
        const updatePromise: Promise<void> = new Promise((resolve, reject) => {
            this.connectionPool.query(updateQuery, (err) => {
                if (err) {
                    reject(err);
                }

                resolve();
            });
        });

        const insertPromise: Promise<void> = new Promise((resolve, reject) => {
            this.connectionPool.query(insertQuery, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });

        return Promise.all([updatePromise, insertPromise]);
    }

    lookupAll(lookupQuery: string): Promise<object[]> {
        return new Promise((resolve, reject) => {
            this.connectionPool.query(lookupQuery, (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });
    }
};