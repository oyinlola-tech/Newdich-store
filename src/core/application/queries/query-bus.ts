import { Query, QueryHandler } from './query.js';

export class QueryBus {
  private readonly handlers = new Map<string, QueryHandler>();

  register(handler: QueryHandler): this {
    this.handlers.set(handler.queryName, handler);
    return this;
  }

  async execute<T extends Query<unknown>>(query: T): Promise<T['__result']> {
    const handler = this.handlers.get(query.constructor.name);
    if (!handler) {
      throw new Error(`No handler registered for query ${query.constructor.name}`);
    }
    return (await handler.handle(query)) as T['__result'];
  }
}
