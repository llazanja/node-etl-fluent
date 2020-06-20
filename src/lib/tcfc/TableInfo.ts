import ISQLDriver from "../driver/ISQLDriver";

export class TableInfo {
    private driver: ISQLDriver;
    private tableName: string;
    private fromClause: string;
    private countAlias: string;
    private groupByAttributes: string[];

    constructor(driver: ISQLDriver, tableName: string, fromClause: string, groupByAttributes: string[], countAlias: string) {
        this.driver = driver;
        this.tableName = tableName;
        this.fromClause = fromClause;
        this.groupByAttributes = groupByAttributes;
        this.countAlias = countAlias;
    }

    getDriver(): ISQLDriver {
        return this.driver;
    }

    getTableName(): string {
        return this.tableName;
    }

    getFromClause(): string {
        return this.fromClause;
    }

    getGroupByAttributes(): string[] {
        return this.groupByAttributes;
    }

    getCountAlias(): string {
        return this.countAlias;
    }
}

export class TableInfoTuple {
    private srcTableInfo: TableInfo;
    private destTableInfo: TableInfo;

    constructor(srcTableInfo: TableInfo, destTableInfo: TableInfo) {
        this.srcTableInfo = srcTableInfo;
        this.destTableInfo = destTableInfo;
    }

    getSrcTableInfo(): TableInfo {
        return this.srcTableInfo;
    }

    getDestTableInfo(): TableInfo {
        return this.destTableInfo;
    }
}