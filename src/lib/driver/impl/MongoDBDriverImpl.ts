import INoSQLDriver from "../INoSQLDriver";
import { MongoClient } from "mongodb";
import { Stream } from "stream";
import logger from "../../../Logger";

export default class MongoDBDriverImpl implements INoSQLDriver {
    connectionPool: MongoClient;
    connectionURI: string;

    constructor(connectionURI: string) {
        this.connectionURI = connectionURI;
    }

    async closePool(): Promise<void> {
        logger.info('Closing pool for MongoDB client');
        await this.connectionPool.close();
    }

    executeQuery(collection: string, query: object): Promise<Stream> {
        return Promise.resolve(this.connectionPool.db().collection(collection).find(query));
    }

    async createPool(): Promise<void> {
        logger.info('Creating pool for MongoDB client');
        const client = new MongoClient(this.connectionURI, { useNewUrlParser: true, poolSize: 20, useUnifiedTopology: true });
        this.connectionPool = await client.connect();
    }
}
