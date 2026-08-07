export abstract class Query<R = unknown> {
  declare readonly __result: R;
}

export interface QueryHandler<T extends Query = Query, R = unknown> {
  readonly queryName: string;
  handle(query: T): Promise<R> | R;
}
