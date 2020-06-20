export default class TableRow {
    private compositeKey: { [key: string]: any };
    private count: number;

    constructor(compositeKey: { [key: string]: any }, count: number) {
        this.compositeKey = compositeKey;
        this.count = count;
    }

    getCompositeKey(): { [key: string]: any } {
        return this.compositeKey;
    }

    getCount(): number {
        return this.count;
    }
}