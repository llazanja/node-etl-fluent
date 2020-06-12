import IDriver from "./etl/IDriver";

export default class ETLExecutor {
    innerPromise: Promise<any[]>;

    constructor() {
        console.time('ETL');
    }

    static startup(...drivers: IDriver[]) {
        drivers.forEach(driver => driver.createPool());
    }

    executeTasksInParralel(...tasks: Promise<any>[]): ETLExecutor {
        if (!this.innerPromise) {
            console.log('Adding tasks batch to executor');
            this.innerPromise = Promise.all(tasks);
        } else {
            this.innerPromise = this.innerPromise.then(() => {
                console.log('Adding tasks batch to executor');

                return Promise.all(tasks); 
            });
        }

        return this;
    }

    cleanup(...drivers: IDriver[]): void {
        this.innerPromise.then(() => {
            drivers.forEach(driver => driver.closePool());
            console.timeEnd('ETL');
        });
    }
}