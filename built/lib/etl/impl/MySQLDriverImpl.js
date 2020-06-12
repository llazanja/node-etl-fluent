"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("mysql");
const DefaultSQLQueryBuilderImpl_1 = require("../../query/DefaultSQLQueryBuilderImpl");
const DateUtil_1 = require("../../util/DateUtil");
const TimeUtil_1 = require("../../util/TimeUtil");
class MySQLDriver extends DefaultSQLQueryBuilderImpl_1.DefaultSQLQueryBuilderImpl {
    constructor(config) {
        super();
        this.config = config;
    }
    closePool() {
        this.connectionPool.end((err) => {
            if (err) {
                return console.log(err);
            }
            console.log('Destroying MYSQL Pool');
        });
    }
    createPool() {
        console.log('Creating MYSQL Pool');
        this.connectionPool = mysql_1.createPool(this.config);
    }
    executeQuery(query) {
        return Promise.resolve(this.connectionPool.query(query).stream());
    }
    selectQueryWithTableAndFields(table, fields) {
        let query = `SELECT`;
        query = fields.reduce((query, field) => `${query} ${field},`, query);
        query = query.substring(0, query.length - 1);
        query = `${query} FROM ${table}`;
        return query;
    }
    async showTables(query) {
        return new Promise((resolve, reject) => {
            this.connectionPool.query(query, (err, results, fields) => {
                if (err) {
                    return reject(err);
                }
                const tables = results.map((dataPacket) => Object.values(dataPacket)[0]);
                resolve(tables);
            });
        });
    }
    async createDateDimensionTable(table, dateFrom, dateTo) {
        if (dateFrom >= dateTo) {
            throw new Error("dateTo must be larger than dateFrom!");
        }
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (DateID SERIAL, Type VARCHAR(15), Date DATE DEFAULT NULL, Year INT DEFAULT NULL, Quarter INT DEFAULT NULL, Month INT DEFAULT NULL, Day INT DEFAULT NULL, DayOfWeek INT DEFAULT NULL, DayOfWeekName VARCHAR(15) DEFAULT NULL, MonthName VARCHAR(15) DEFAULT NULL)`;
        await this.createTable(createTableQuery);
        const insertQuery = `INSERT INTO ${table} (Type, Date, Year, Quarter, Month, Day, DayOfWeek, DayOfWeekName, MonthName) VALUES ?`;
        const promises = [];
        let values = [
            ['Unkown', null, null, null, null, null, null, null, null],
            ['Not applicable', null, null, null, null, null, null, null, null]
        ];
        for (let currentDate = dateFrom; currentDate <= dateTo; currentDate.setDate(currentDate.getDate() + 1)) {
            values.push(['Date', DateUtil_1.getDate(currentDate), currentDate.getFullYear(), DateUtil_1.getQuarter(currentDate), currentDate.getMonth() + 1, currentDate.getDate() - 1, currentDate.getDay(), DateUtil_1.dayOfWeekNumberToName(currentDate.getDay()), DateUtil_1.monthNumberToName(currentDate.getMonth())]);
            if (values.length === 10000) {
                promises.push(new Promise((resolve, reject) => {
                    this.connectionPool.query(insertQuery, [JSON.parse(JSON.stringify(values))], (err) => {
                        if (err)
                            reject(err);
                        resolve();
                    });
                }));
                values = [];
            }
        }
        if (values.length > 0) {
            promises.push(new Promise((resolve, reject) => {
                this.connectionPool.query(insertQuery, [JSON.parse(JSON.stringify(values))], (err) => {
                    if (err)
                        reject(err);
                    resolve();
                });
            }));
        }
        return Promise.all(promises);
    }
    async createTimeDimensionTable(table) {
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (TimeID SERIAL, Type VARCHAR(15), Time TIME, SecondsAfterMidnight INT, MinutesAfterMidnight INT, Seconds INT, Minutes INT, Hour INT, Period VARCHAR(15))`;
        await this.createTable(createTableQuery);
        const insertQuery = `INSERT INTO ${table} (Type, Time, SecondsAfterMidnight, MinutesAfterMidnight, Seconds, Minutes, Hour, Period) VALUES ?`;
        const promises = [];
        let values = [
            ['Unkown', null, null, null, null, null, null, null],
            ['Not applicable', null, null, null, null, null, null, null]
        ];
        for (let currentDate = new Date('December 25, 1995 00:00:00'), endDate = new Date('December 25, 1995 23:59:59'); currentDate <= endDate; currentDate.setSeconds(currentDate.getSeconds() + 1)) {
            values.push(['Time', TimeUtil_1.getTime(currentDate), TimeUtil_1.getSecondsAfterMidnight(currentDate), TimeUtil_1.getMinutesAfterMidnight(currentDate), currentDate.getUTCSeconds(), currentDate.getUTCMinutes(), currentDate.getUTCHours(), TimeUtil_1.getPeriod(currentDate)]);
            if (values.length === 10000) {
                promises.push(new Promise((resolve, reject) => {
                    this.connectionPool.query(insertQuery, [JSON.parse(JSON.stringify(values))], (err) => {
                        if (err)
                            reject(err);
                        resolve();
                    });
                }));
                values = [];
            }
        }
        if (values.length > 0) {
            promises.push(new Promise((resolve, reject) => {
                this.connectionPool.query(insertQuery, [JSON.parse(JSON.stringify(values))], (err) => {
                    if (err)
                        reject(err);
                    resolve();
                });
            }));
        }
        return Promise.all(promises);
    }
    async lookupAttribute(table, attributeToLookup, joinAttribute, joinValue) {
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
    batchInsertQueryWithChunks(table, chunkArray) {
        let insertQuery = `INSERT INTO ${table} (`;
        insertQuery = Object.keys(chunkArray[0]).reduce((insertQuery, key) => `${insertQuery}${key}, `, insertQuery);
        insertQuery = insertQuery.substring(0, insertQuery.length - 2);
        insertQuery = `${insertQuery}) VALUES ?`;
        const values = [];
        chunkArray.forEach((chunk) => {
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
    createTable(query) {
        return new Promise((resolve, reject) => {
            this.connectionPool.query(query, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
}
exports.default = MySQLDriver;
;
