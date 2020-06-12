import INoSQLDriver from "../INoSQLDriver";
import { MongoClient } from "mongodb";
import { Stream } from "stream";

export default class MongoDBDriverImpl implements INoSQLDriver {
    connectionPool: MongoClient;
    connectionURI: string;

    constructor(connectionURI: string) {
        this.connectionURI = connectionURI;
    }

    async closePool(): Promise<void> {
        console.log('Closing pool for MongoDB client');
        await this.connectionPool.close();
    }

    executeQuery(collection: string, query: object): Promise<Stream> {
        return Promise.resolve(this.connectionPool.db().collection(collection).find(query));
    }

    async createPool(): Promise<void> {
        console.log('Creating pool for MongoDB client');
        const client = new MongoClient(this.connectionURI, { useNewUrlParser: true, poolSize: 20, useUnifiedTopology: true });
        this.connectionPool = await client.connect();
    }
}
