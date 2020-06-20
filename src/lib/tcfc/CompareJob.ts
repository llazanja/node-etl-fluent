import ISQLDriver from "../driver/ISQLDriver";
import { TableInfo } from "./TableInfo";
import { TableDifferenceRow } from "./TableDifferenceRow";
import logger from '../../Logger';

export default class CompareJob {
    private depth: number;
    private errDepth: number;
    private srcTableInfo: TableInfo;
    private destTableInfo: TableInfo;
    private unevenDiffs: TableDifferenceRow[];
    private excessDiffs: TableDifferenceRow[];
    private children: CompareJob[];

    constructor(depth: number, errDepth: number,  srcTableInfo: TableInfo, destTableInfo: TableInfo) {
        this.depth = depth;
        this.errDepth = errDepth;
        this.srcTableInfo = srcTableInfo;
        this.destTableInfo = destTableInfo;
        this.children = [];
        this.unevenDiffs = [];
        this.excessDiffs = [];
    }

    getDepth(): number {
        return this.depth;
    }

    getErrDepth(): number {
        return this.errDepth;
    }

    getChildren(): CompareJob[] {
        return this.children;
    }

    getSrcTableName(): string {
        return this.getTableName(this.srcTableInfo);
    }

    getDestTableName(): string {
        return this.getTableName(this.destTableInfo);
    }

    getTableName(tableInfo: TableInfo): string {
        return tableInfo.getTableName();
    }

    getSrcSQL(): string {
        return this.getSQL(this.srcTableInfo);
    }

    getDestSQL(): string {
        return this.getSQL(this.destTableInfo);
    }

    getSrcDriver(): ISQLDriver {
        return this.srcTableInfo.getDriver();
    }

    getDestDriver(): ISQLDriver {
        return this.destTableInfo.getDriver();
    }

    getSrcCountAlias(): string {
        return this.getCountAlias(this.srcTableInfo);
    }

    getDestCountAlias(): string {
        return this.getCountAlias(this.destTableInfo);
    }

    private getCountAlias(tableInfo: TableInfo): string {
        return tableInfo.getCountAlias();
    }

    getSrcGroupByAttributes(): string[] {
        return this.getGroupByAttributes(this.srcTableInfo);
    }

    getDestGroupByAttributes(): string[] {
        return this.getGroupByAttributes(this.destTableInfo);
    }

    private getGroupByAttributes(tableInfo: TableInfo): string[] {
        return tableInfo.getGroupByAttributes();
    }

    addUnevenTableDifferenceRow(row: TableDifferenceRow) {
        this.unevenDiffs.push(row);
    }

    addExcessTableDifferenceRow(row: TableDifferenceRow) {
        this.excessDiffs.push(row);
    }

    getUnevenDiffs(): TableDifferenceRow[] {
        return this.unevenDiffs;
    }

    getExcessDiffs(): TableDifferenceRow[] {
        return this.excessDiffs;
    }

    loadChildren(): void {
        if (this.unevenDiffs.length > 0 || this.excessDiffs.length > 0) {
            this.children.push(new CompareJob(this.depth + 1, this.depth, this.srcTableInfo, this.destTableInfo));
        } else {
            this.children.push(new CompareJob(this.depth + 1, 0, this.srcTableInfo, this.destTableInfo));
        }
    }

    printDiffs(): void {
        this.excessDiffs.forEach(diff => logger.info(diff.toString()));
        this.unevenDiffs.forEach(diff => logger.info(diff.toString()));
    }

    private getSQL(tableInfo: TableInfo): string {
        let query = 'SELECT ';

        if (this.depth > 0) {
            const attributes = tableInfo.getGroupByAttributes();
            for (let i = 0; i < this.depth; i++) {
                query += `${attributes[i]}, `;
            }
        }

        query += `COUNT(*) AS ${tableInfo.getCountAlias()} ${tableInfo.getFromClause()} `;

        if (this.depth > 0) {
            query += `GROUP BY `;

            const attributes = tableInfo.getGroupByAttributes();
            for (let i = 0; i < this.depth; i++) {
                query += `${attributes[i]}${i == this.depth - 1 ? '' : ', '}`;
            }
        }

        
        return query;
    }

    compareTo(other: CompareJob) {
        if (this.errDepth == 0 && other.errDepth > 0) return 1;
        else if (this.errDepth > 0 && other.errDepth == 0) return -1;
        else if (this.errDepth < other.errDepth) return -1;
        else if (this.errDepth > other.errDepth) return 1;

        if (this.depth < other.depth) return 1;
        else if (this.depth > other.depth) return -1;

        return (this.srcTableInfo.getTableName() + '' + this.destTableInfo.getTableName())
            .localeCompare(other.srcTableInfo.getTableName() + '' + other.destTableInfo.getTableName());
    }
};