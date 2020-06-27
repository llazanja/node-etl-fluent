import ISQLDriver from "./driver/ISQLDriver";
import INoSQLDriver from "./driver/INoSQLDriver";
import { Stream, Transform, TransformCallback } from "stream";
import * as fs from 'fs';
import * as csv from "csv-parser";

type StringMap = {
    [key: string]: string
};

type Options = {
    batchSize?: number
};

export default class ETLTask implements PromiseLike<Stream> {
    innerPromise: Promise<Stream>;
    options: Options;

    constructor(options: Options = { batchSize: 10000 }) {
        this.options = options;
    }

    then<TResult1 = Stream, TResult2 = never>(onfulfilled?: (value: Stream) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): PromiseLike<TResult1 | TResult2> {
        return this.innerPromise.then(onfulfilled, onrejected);
    }

    fromSQLDatabase(driver: ISQLDriver, query: string): ETLTask {
        this.innerPromise = (async() => {
            return await driver.getStreamByQuery(query);
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

    toCSVFile(filename: string, encoding: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(filename, { encoding });

            output.on('error', err => reject(err));
            
            let wroteHeader = false;

            this.innerPromise.then(stream => {                
                stream.on('data', (chunk: object) => {
                    console.log('DATA ', chunk);
                    if (!wroteHeader) {
                        let header = '';

                        Object.keys(chunk).forEach(key => {
                            header = `${header}${key},`
                        });

                        header = header.substring(0, header.length - 1);

                        output.write(`${header}\r\n`);

                        wroteHeader = true;
                    }

                    let row = '';

                    Object.values(chunk).forEach(value => {
                        row = `${row}${value},`
                    });

                    row = row.substring(0, row.length - 1);

                    output.write(`${row}\r\n`);
                });
        
                stream.on('error', (err) => {
                    reject(err);
                });

                stream.on('end', () => {
                    resolve();
                });
            });
        });
    }

    toSQLDatabase(driver: ISQLDriver, table: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.innerPromise.then(stream => {                
                const chunkArray: object[] = [];
                const inserts: Promise<void>[] = [];

                stream.on('data', (chunk: object) => {
                    chunkArray.push(chunk);

                    if (chunkArray.length === this.options.batchSize) {
                        inserts.push(driver.batchInsertQueryWithChunks(table, JSON.parse(JSON.stringify(chunkArray))));
                        chunkArray.splice(0, chunkArray.length);
                    }
                });
        
                stream.on('error', (err) => {
                    reject(err);
                });

                stream.on('end', () => {
                    if (chunkArray.length > 0) {
                        inserts.push(driver.batchInsertQueryWithChunks(table, JSON.parse(JSON.stringify(chunkArray))));
                    }
                    Promise.all(inserts).then(() => {
                        resolve();
                    });
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