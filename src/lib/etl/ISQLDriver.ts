import { Stream } from 'stream';
import IDriver from './IDriver';

export default interface ISQLDriver extends IDriver {
    config: object;

    createTable(query: string): Promise<void>;
    executeQuery(query: string): Promise<Stream>;
    batchInsertQueryWithChunks(table: string, chunkArray: object[]): Promise<void>;
    lookupAttribute(table: string, attributeToLookup: string, joinAttribute: string, joinValue: string): Promise<string>;
    showTables(query: string): Promise<string[]>;
    createDateDimensionTable(table: string, dateFrom: Date, dateTo: Date): Promise<any[]>;
    createTimeDimensionTable(table: string): Promise<any[]>;
};