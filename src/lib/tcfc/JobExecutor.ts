import CompareJob from "./CompareJob";
import { TableDifferenceRow, TableDifferenceType } from "./TableDifferenceRow";
import RowUtil from "./RowUtil";

export default class JobExecutor {
    static async executeJob(job: CompareJob): Promise<void> {
        const srcSQL = job.getSrcSQL();
        const destSQL = job.getDestSQL();

        const srcDriver = job.getSrcDriver();
        const destDriver = job.getDestDriver();

        const srcResults = await srcDriver.executeQuery(srcSQL);
        const destResults = await destDriver.executeQuery(destSQL);

        const srcRowMap = RowUtil.toRowMap(srcResults, job.getDepth(), job.getSrcGroupByAttributes(), job.getSrcCountAlias());
        const destRowMap = RowUtil.toRowMap(destResults, job.getDepth(), job.getDestGroupByAttributes(), job.getDestCountAlias());

        const srcGroupByAttributes = job.getSrcGroupByAttributes();
        const destGroupByAttributes = job.getDestGroupByAttributes();

        const srcTableName = job.getSrcTableName();
        const destTableName = job.getDestTableName();

        const depth = job.getDepth();

        for (let srcRowKey of srcRowMap.keys()) {
            if (!destRowMap.has(srcRowKey)) {
                job.addExcessTableDifferenceRow(
                    new TableDifferenceRow(TableDifferenceType.EXCESS, srcTableName, destTableName, srcRowKey, srcGroupByAttributes.slice(0, depth), destGroupByAttributes.slice(0, depth), srcRowMap.get(srcRowKey), 0)
                );
            } else {
                const srcCount = srcRowMap.get(srcRowKey);
                const destCount = destRowMap.get(srcRowKey);

                if (srcCount !== destCount) {
                    job.addUnevenTableDifferenceRow(
                        new TableDifferenceRow(TableDifferenceType.UNEVEN, srcTableName, destTableName, srcRowKey, srcGroupByAttributes.slice(0, depth), destGroupByAttributes.slice(0, depth), srcCount, destCount)
                    );
                }

                destRowMap.delete(srcRowKey);
            }
        }

        for (let leftOverRowKey of destRowMap.keys()) {
            job.addExcessTableDifferenceRow(
                new TableDifferenceRow(TableDifferenceType.EXCESS, srcTableName, destTableName, leftOverRowKey, srcGroupByAttributes.slice(0, depth), destGroupByAttributes.slice(0, depth), 0, destRowMap.get(leftOverRowKey))
            );
        }

        job.loadChildren();
        job.printDiffs();
    }
}