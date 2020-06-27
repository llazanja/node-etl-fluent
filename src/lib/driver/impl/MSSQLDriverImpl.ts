import ISQLDriver from '../ISQLDriver';
import { config, ConnectionPool } from 'mssql';
import logger from '../.././../Logger';
import { Readable, Stream } from 'stream';
import { DefaultSQLQueryBuilderImpl } from '../../query/DefaultSQLQueryBuilderImpl';

export default class MySQLDriver extends DefaultSQLQueryBuilderImpl implements ISQLDriver {
    config: config;
    connectionPool: ConnectionPool;

    constructor(config: { server: string, database: string }) {
        super();
        this.config = config;
        this.connectionPool = new ConnectionPool(this.config, ((err: any) => logger.error(err)));
    }

    async closePool(): Promise<void> {
        try {
            await this.connectionPool.close();
        } catch(err) {
            logger.error(err);
        }
    }

    async createPool(): Promise<void> {
        try {
            await this.connectionPool.connect();
        } catch(err) {
            logger.error(err);
        }
    }

    async getStreamByQuery(query: string): Promise<Stream> {
        const request = this.connectionPool.request();
        request.stream = true;
        request.query(query);

        this.connectionPool.on('error', err => logger.error(err))

        const readableStream = new Readable({
            objectMode: true,
            read() {}
         });

        request.on('row', row => {
            readableStream.push(row);
        });

        request.on('error', err => logger.error(err));

        request.on('done', result => {
            readableStream.push(null);
        });

        return Promise.resolve(readableStream);
    }

    join(query: string, srcTable: string, srcAttribute: string, destTable: string, destAttribute: string): string {
        return `${query} JOIN ${destTable} ON ${srcTable}.${srcAttribute} = ${destTable}.${destAttribute} `;
    }

    async executeQuery(query: string): Promise<object[]> {
        const result = await this.connectionPool.request().query(query);

        return result.recordset;
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
            resolve([]);
        });
    }

    async createDateDimensionTable(table: string, dateFrom: Date, dateTo: Date): Promise<any[]> {
       return Promise.resolve([]);
    }

    async createTimeDimensionTable(table: string): Promise<any[]> {
        return Promise.resolve([]);
    }

    async lookupAttribute(table: string, attributeToLookup: string, joinAttribute: string, joinValue: string): Promise<string> {
        return Promise.resolve('');
    }

    batchInsertQueryWithChunks(table: string, chunkArray: object[]): Promise<void> {
        return Promise.resolve();
    }

    createTable(query: string): Promise<void> {
        return Promise.resolve();
    }

    scdUpdate(updateQuery: string, insertQuery: string): Promise<void[]> {       
        return Promise.resolve([]);

    }

    lookupAll(lookupQuery: string): Promise<object[]> {
        return Promise.resolve([]);
    }
};