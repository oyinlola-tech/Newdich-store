export interface FlutterwaveWebhookEvent {
  event: string;
  data: Record<string, unknown>;
}

export type FlutterwaveEventName =
  | 'charge.completed'
  | 'charge.failed'
  | 'transfer.completed'
  | 'refund.completed';
