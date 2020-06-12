"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ETLExecutor {
    constructor() {
        console.time('ETL');
    }
    static startup(...drivers) {
        drivers.forEach(driver => driver.createPool());
    }
    executeTasksInParralel(...tasks) {
        if (!this.innerPromise) {
            console.log('Adding tasks batch to executor');
            this.innerPromise = Promise.all(tasks);
        }
        else {
            this.innerPromise = this.innerPromise.then(() => {
                console.log('Adding tasks batch to executor');
                return Promise.all(tasks);
            });
        }
        return this;
    }
    cleanup(...drivers) {
        this.innerPromise.then(() => {
            drivers.forEach(driver => driver.closePool());
            console.timeEnd('ETL');
        });
    }
}
exports.default = ETLExecutor;
