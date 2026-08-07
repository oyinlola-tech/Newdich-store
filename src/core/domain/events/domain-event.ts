export interface DomainEvent<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly payload: T;
}
