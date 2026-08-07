import type { DomainEvent } from '../../../../core/domain/events/domain-event.js';

export class ProductUpdatedEvent implements DomainEvent<{ productId: string }> {
  readonly eventName = 'product.updated';
  readonly occurredAt: Date;

  constructor(readonly payload: { productId: string }) {
    this.occurredAt = new Date();
  }
}
