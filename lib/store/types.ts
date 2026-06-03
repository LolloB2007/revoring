export interface Predicate<T> {
  (row: T): boolean;
}

export interface StoreApi {
  all<T>(table: string): Promise<T[]>;
  findOne<T>(table: string, p: Predicate<T>): Promise<T | undefined>;
  findMany<T>(table: string, p?: Predicate<T>): Promise<T[]>;
  insert<T>(table: string, row: T): Promise<T>;
  insertMany<T>(table: string, rows: T[]): Promise<T[]>;
  updateWhere<T>(
    table: string,
    p: Predicate<T>,
    patch: Partial<T> | ((row: T) => Partial<T>),
  ): Promise<number>;
  upsert<T>(
    table: string,
    p: Predicate<T>,
    factory: () => T,
    patch?: Partial<T> | ((row: T) => Partial<T>),
  ): Promise<T>;
  deleteWhere<T>(table: string, p: Predicate<T>): Promise<number>;
  replaceAll<T>(table: string, rows: T[]): Promise<void>;
}
