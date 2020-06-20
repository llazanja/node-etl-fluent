export default interface IDriver {
    connectionPool: object;

    closePool(): void;
    createPool(): void;
}