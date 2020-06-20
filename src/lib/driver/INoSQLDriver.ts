import { Stream } from 'stream';
import IDriver from './IDriver';

export default interface INoSQLDriver extends IDriver {
    connectionURI: string;

    executeQuery(collection: string, query: object): Promise<Stream>;
};