import { Stream } from 'stream';
import IDriver from './IDriver';

export default interface ISQLDriver extends IDriver {
    config: object;

    batchInsertQueryWithChunks(table: string, chunkArray: object[]): Promise<void>;
    createDateDimensionTable(table: string, dateFrom: Date, dateTo: Date): Promise<any[]>;
    createTimeDimensionTable(table: string): Promise<any[]>;
    createTable(query: string): Promise<void>;
    executeQuery(query: string): Promise<object[]>;
    getStreamByQuery(query: string): Promise<Stream>;
    lookupAll(lookupQuery: string): Promise<object[]>;
    lookupAttribute(table: string, attributeToLookup: string, joinAttribute: string, joinValue: string): Promise<string>;
    scdUpdate(updateQuery: string, insertQuery: string): Promise<void[]>;
    showTables(query: string): Promise<string[]>;
};