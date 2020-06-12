export default interface ISQLQueryBuilder {
    conjunction(query: string): string;
    disjunction(query: string): string;
    filterEqual(query:string, field: string, value: string): string;
    filterNotEqual(query:string, field: string, value: string): string;
    filterGreaterThan(query:string, field: string, value: number): string;
    filterGreaterThanOrEqualTo(query:string, field: string, value: number): string;
    filterLessThan(query:string, field: string, value: number): string;
    filterLessThanOrEqualTo(query:string, field: string, value: number): string;
    selectQueryWithTable(table: string): string;
    selectQueryWithTableAndFields(table: string, fields: string[]): string;
    where(query: string): string;
}