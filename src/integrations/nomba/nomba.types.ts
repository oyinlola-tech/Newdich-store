export interface NombaWebhookEvent {
  event: string;
  data: Record<string, unknown>;
}

export type NombaEventName = 'payment_intent.succeeded' | 'payment_intent.failed' | 'refund.completed';
