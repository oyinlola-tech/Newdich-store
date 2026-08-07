import { createHmac } from 'node:crypto';

export interface PaystackWebhookEvent {
  event: string;
  data: Record<string, unknown>;
}

export interface PaystackWebhookPayload {
  id: number;
  reference: string;
  amount: number;
  status: string;
  paid_at: string | null;
  channel: string | null;
}

export function verifyPaystackSignature(payload: string, signature: string, secretKey: string): boolean {
  const expected = createHmac('sha512', secretKey).update(payload).digest('hex');
  return signature === expected;
}
