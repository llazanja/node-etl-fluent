import ISQLDriver from "./etl/ISQLDriver";
import { Stream, Transform, TransformCallback } from "stream";
import { stringify } from 'jsonstream';
import INoSQLDriver from "./etl/INoSQLDriver";
import * as events from 'events';
import * as fs from 'fs';
import * as csv from "csv-parser";

type StringMap = {
    [key: string]: string
};

export default class ETLTask extends events.EventEmitter implements PromiseLike<Stream> {
    innerPromise: Promise<Stream>;
    taskNumber: number;
    taskName: string;

    constructor(taskNumber: number, taskName: string) {
        super();

        this.on('finish', () => console.log(`Finished executing ETLTask number ${taskNumber} - ${taskName}`));
    }

    then<TResult1 = Stream, TResult2 = never>(onfulfilled?: (value: Stream) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): PromiseLike<TResult1 | TResult2> {
        return this.innerPromise.then(onfulfilled, onrejected);
    }

    fromSQLDatabase(driver: ISQLDriver, query: string): ETLTask {
        this.innerPromise = (async() => {
            return await driver.executeQuery(query);
        })();

        return this;
    }

    fromNoSQLDatabase(driver: INoSQLDriver, collection: string, query: object): ETLTask {
        this.innerPromise = (async() => {
            return await driver.executeQuery(collection, query);
        })();

        return this;
    }

    fromCSVFile(filename: string, encoding: string): ETLTask {
        this.innerPromise = (async() => {
            return fs.createReadStream(filename, { encoding }).pipe(csv());
        })();

        return this;
    }

    toUpperCase(...attributes: string[]): ETLTask {
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

    toLowerCase(...attributes: string[]): ETLTask {
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

    renameAttributes(namesMap: StringMap): ETLTask {
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

    lookupAndReplace(driver: ISQLDriver, table: string, attributeToReplace: string, attributeToLookup: string, joinAttribute: string) {
        this.pipeTransformStream(async (row, output, callback) => {
            if (attributeToReplace in row) {
                row[attributeToLookup] = await driver.lookupAttribute(table, attributeToLookup, joinAttribute, row[attributeToReplace]);
                if (attributeToLookup !== attributeToReplace) delete row[attributeToReplace];
            }
            callback(null, row);
        });

        return this;
    }

    toSQLDatabase(driver: ISQLDriver, table: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.innerPromise.then(stream => {                
                const chunkArray: object[] = [];
                const inserts: Promise<void>[] = [];

                stream.on('data', (chunk: object) => {
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

    toStdOut(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.innerPromise.then(stream => {
                const str = stream.pipe(stringify()).pipe(process.stdout);

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

    private pipeTransformStream(chunkWorker: (row: StringMap, output: Transform, callback: TransformCallback) => void | Promise<void>): void {
        const transformStream = new Transform({
            objectMode: true,
            transform(row: StringMap, encoding: string, callback: TransformCallback) {
                chunkWorker(row, this, callback);
            }
        });

        this.innerPromise = this.innerPromise.then(stream => {
            return stream.pipe(transformStream);
        });
    }
}