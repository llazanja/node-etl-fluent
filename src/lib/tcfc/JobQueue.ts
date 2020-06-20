import CompareJob from "./CompareJob";
import { TableInfoTuple } from "./TableInfo";

export default class JobQueue {
    private queue: CompareJob[];

    constructor() {
        this.queue = [];
    }

    hasNext(): boolean {
        return this.queue.length > 0;
    }

    addJob(job: CompareJob) {
        this.queue.push(job);
        this.queue.sort((a, b) => a.compareTo(b));
    }

    getNextJob(): CompareJob {
        return this.queue.pop();
    }

    async initialize(tableInfoTuples: TableInfoTuple[]): Promise<void> {
        for (let tableInfoTuple of tableInfoTuples) {
            const job = new CompareJob(0, 0, tableInfoTuple.getSrcTableInfo(), tableInfoTuple.getDestTableInfo());

            this.addJob(job);
        }
    }
}