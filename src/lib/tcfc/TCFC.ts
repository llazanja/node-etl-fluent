import JobQueue from "./JobQueue";
import JobExecutor from "./JobExecutor";
import { TableInfoTuple } from "./TableInfo";

export async function tcfc(tableInfoTuples: TableInfoTuple[], maxHealthyDepth: number, timeLimit: number): Promise<void> {
    let timeExceeded = false;

    setTimeout(() => { timeExceeded = true }, timeLimit);
    
    const jobQueue = new JobQueue();
    jobQueue.initialize(tableInfoTuples);

    while (!timeExceeded && jobQueue.hasNext()) {
        const job = jobQueue.getNextJob();

        if (job.getDepth() === maxHealthyDepth && job.getErrDepth() === 0) continue;
        else if (job.getDepth() > job.getSrcGroupByAttributes().length) continue;

        await JobExecutor.executeJob(job);

        job.getChildren().forEach(childJob => jobQueue.addJob(childJob));
    }
};
