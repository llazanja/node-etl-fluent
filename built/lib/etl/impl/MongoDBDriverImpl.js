"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class MongoDBDriverImpl {
    constructor(connectionURI) {
        this.connectionURI = connectionURI;
    }
    async closePool() {
        console.log('Closing pool for MongoDB client');
        await this.connectionPool.close();
    }
    executeQuery(collection, query) {
        return Promise.resolve(this.connectionPool.db().collection(collection).find(query));
    }
    async createPool() {
        console.log('Creating pool for MongoDB client');
        const client = new mongodb_1.MongoClient(this.connectionURI, { useNewUrlParser: true, poolSize: 20, useUnifiedTopology: true });
        this.connectionPool = await client.connect();
    }
}
exports.default = MongoDBDriverImpl;
