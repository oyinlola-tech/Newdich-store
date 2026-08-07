import type { DomainEvent } from '../../../../core/domain/events/domain-event.js';

export class ProductCreatedEvent implements DomainEvent<{ productId: string; name: string }> {
  readonly eventName = 'product.created';
  readonly occurredAt: Date;

  constructor(readonly payload: { productId: string; name: string }) {
    this.occurredAt = new Date();
  }
}
