"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const jsonstream_1 = require("JSONStream");
const events = require("events");
const fs = require("fs");
const csv = require("csv-parser");
class ETLTask extends events.EventEmitter {
    constructor(taskNumber, taskName) {
        super();
        this.on('finish', () => console.log(`Finished executing ETLTask number ${taskNumber} - ${taskName}`));
    }
    then(onfulfilled, onrejected) {
        return this.innerPromise.then(onfulfilled, onrejected);
    }
    fromSQLDatabase(driver, query) {
        this.innerPromise = (async () => {
            return await driver.executeQuery(query);
        })();
        return this;
    }
    fromNoSQLDatabase(driver, collection, query) {
        this.innerPromise = (async () => {
            return await driver.executeQuery(collection, query);
        })();
        return this;
    }
    fromCSVFile(filename, encoding) {
        this.innerPromise = (async () => {
            return fs.createReadStream(filename, { encoding }).pipe(csv());
        })();
        return this;
    }
    toUpperCase(...attributes) {
        this.pipeTransformStream((row, output, callback) => {
            for (let attribute of attributes) {
                if (attribute in row) {
                    row[attribute] = row[attribute].toUpperCase();
                }
            }
            callback(null, row);
        });
        return this;
    }
    toLowerCase(...attributes) {
        this.pipeTransformStream((row, output, callback) => {
            for (let attribute of attributes) {
                if (attribute in row) {
                    row[attribute] = row[attribute].toLowerCase();
                }
            }
            callback(null, row);
        });
        return this;
    }
    renameAttributes(namesMap) {
        this.pipeTransformStream((row, output, callback) => {
            for (let attribute of Object.keys(namesMap)) {
                if (attribute in row) {
                    row[namesMap[attribute]] = row[attribute];
                    delete row[attribute];
                }
            }
            callback(null, row);
        });
        return this;
    }
    lookupAndReplace(driver, table, attributeToReplace, attributeToLookup, joinAttribute) {
        this.pipeTransformStream(async (row, output, callback) => {
            if (attributeToReplace in row) {
                row[attributeToLookup] = await driver.lookupAttribute(table, attributeToLookup, joinAttribute, row[attributeToReplace]);
                if (attributeToLookup !== attributeToReplace)
                    delete row[attributeToReplace];
            }
            callback(null, row);
        });
        return this;
    }
    toSQLDatabase(driver, table) {
        return new Promise((resolve, reject) => {
            this.innerPromise.then(stream => {
                const chunkArray = [];
                const inserts = [];
                stream.on('data', (chunk) => {
                    chunkArray.push(chunk);
                    if (chunkArray.length === 10000) {
                        inserts.push(driver.batchInsertQueryWithChunks(table, JSON.parse(JSON.stringify(chunkArray))));
                        chunkArray.splice(0, chunkArray.length);
                    }
                });
                stream.on('error', (err) => {
                    console.log(err.stack);
                    reject();
                });
                stream.on('end', () => {
                    if (chunkArray.length > 0) {
                        inserts.push(driver.batchInsertQueryWithChunks(table, JSON.parse(JSON.stringify(chunkArray))));
                    }
                    Promise.all(inserts).then(() => {
                        this.emit('finish');
                        resolve();
                    });
                });
            });
        });
    }
    toStdOut() {
        return new Promise((resolve, reject) => {
            this.innerPromise.then(stream => {
                const str = stream.pipe(jsonstream_1.stringify()).pipe(process.stdout);
                str.on('error', (err) => {
                    reject(err);
                });
                str.on('end', () => {
                    this.emit('finish');
                    resolve();
                });
            });
        });
    }
    pipeTransformStream(chunkWorker) {
        const transformStream = new stream_1.Transform({
            objectMode: true,
            transform(row, encoding, callback) {
                chunkWorker(row, this, callback);
            }
        });
        this.innerPromise = this.innerPromise.then(stream => {
            return stream.pipe(transformStream);
        });
    }
}
exports.default = ETLTask;
