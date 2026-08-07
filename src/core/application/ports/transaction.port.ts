export interface TransactionPort {
  execute<T>(fn: (tx: T) => Promise<T>): Promise<T>;
}
