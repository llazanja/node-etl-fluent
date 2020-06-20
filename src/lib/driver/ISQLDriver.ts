import { Stream } from 'stream';
import IDriver from './IDriver';

export default interface ISQLDriver extends IDriver {
    config: object;

    createTable(query: string): Promise<void>;
    getStreamByQuery(query: string): Promise<Stream>;
    executeQuery(query: string): Promise<object[]>;
    batchInsertQueryWithChunks(table: string, chunkArray: object[]): Promise<void>;
    lookupAttribute(table: string, attributeToLookup: string, joinAttribute: string, joinValue: string): Promise<string>;
    showTables(query: string): Promise<string[]>;
    createDateDimensionTable(table: string, dateFrom: Date, dateTo: Date): Promise<any[]>;
    createTimeDimensionTable(table: string): Promise<any[]>;
    scdUpdate(updateQuery: string, insertQuery: string): Promise<void[]>;
    lookupAll(lookupQuery: string): Promise<object[]>;
};