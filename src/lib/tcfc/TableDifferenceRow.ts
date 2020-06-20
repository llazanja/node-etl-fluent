export class TableDifferenceRow {
    private rowKey: string;
    private srcTableName: string;
    private destTableName: string;
    private srcCount: number;
    private destCount: number;
    private srcAttributes: string[];
    private destAttributes: string[];
    private type: TableDifferenceType;

    constructor(type: TableDifferenceType, srcTableName: string, destTableName: string, rowKey: string, srcAttributes: string[], destAttributes: string[], srcCount: number, destCount: number) {
        this.type = type;
        this.srcTableName = srcTableName;
        this.destTableName = destTableName;
        this.rowKey = rowKey;
        this.srcCount = srcCount;
        this.destCount = destCount;
        this.srcAttributes = srcAttributes;
        this.destAttributes = destAttributes;
    }

    getType(): TableDifferenceType {
        return this.type;
    }

    getRowKey(): string {
        return this.rowKey;
    }

    getSrcAttributes(): string[] {
        return this.srcAttributes;
    }

    getDestAttributes(): string[] {
        return this.destAttributes;
    }

    getSrcCount(): number {
        return this.srcCount;
    }

    getDestCount(): number {
        return this.destCount;
    }

    toString(): string {
        return `{\r\n    TYPE: ${this.type}\r\n    Table1: ${this.srcTableName}, Table2: ${this.destTableName} \r\n    RowKey: ${this.rowKey.toString()}\r\n    GroupByAttributes1: [${this.srcAttributes}], GroupByAttributes2:  [${this.destAttributes}]\r\n    Count1: ${this.srcCount}, Count2: ${this.destCount}\r\n}`;
    }
}

export enum TableDifferenceType {
    EXCESS = 'EXCESS', UNEVEN = 'UNEVEN'
};