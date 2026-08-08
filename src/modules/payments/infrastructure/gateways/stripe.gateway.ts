import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PaymentGateway, GatewayCredentials, InitializeResult, VerificationResult } from './payment-gateway.types.js';

const API_BASE = 'https://api.stripe.com/v1';

interface StripeCheckoutSession {
  id?: string;
  url?: string;
  payment_status?: string;
  status?: string;
  customer_email?: string;
  amount_total?: number;
  client_reference_id?: string;
}

export class StripeGateway implements PaymentGateway {
  readonly name = 'stripe' as const;
  readonly inlineScriptUrl = 'https://js.stripe.com/v3/';

  constructor(private readonly credentials: GatewayCredentials) {}

  private get secretKey(): string {
    if (!this.credentials.secretKey) {
      throw new Error('Stripe secret key is not configured.');
    }
    return this.credentials.secretKey;
  }

  private async formRequest(
    path: string,
    body: Record<string, string | number>
  ): Promise<{ ok: boolean; status: number; body: unknown }> {
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      form.append(key, String(value));
    }
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, body: data };
  }

  async initialize(input: {
    amount: number;
    currency: string;
    email: string;
    reference: string;
    method: 'CARD' | 'TRANSFER';
    orderNumber: string;
  }): Promise<InitializeResult> {
    // Stripe Checkout Session — customer is redirected to Stripe's hosted page.
    const result = await this.formRequest('/checkout/sessions', {
      mode: 'payment',
      'line_items[0][quantity]': 1,
      'line_items[0][price_data][currency]': input.currency ?? 'NGN',
      'line_items[0][price_data][unit_amount]': Math.round(input.amount * 100),
      'line_items[0][price_data][product_data][name]': `Order ${input.orderNumber}`,
      'client_reference_id': input.reference,
      'customer_email': input.email,
      'payment_method_types[0]': 'card',
      success_url: `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000'}/payment/complete?reference=${input.reference}`,
      cancel_url: `${process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000'}/checkout?cancelled=1`
    });

    if (!result.ok) {
      throw new Error(`Stripe checkout session failed (${result.status}).`);
    }
    const data = result.body as StripeCheckoutSession;
    if (!data.url) {
      throw new Error('Stripe checkout session returned no url.');
    }

    return {
      reference: input.reference,
      redirectUrl: data.url
    };
  }

  async verify(reference: string): Promise<VerificationResult> {
    const url = `${API_BASE}/checkout/sessions?limit=100&client_reference_id=${encodeURIComponent(reference)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.secretKey}` }
    });
    const body = (await response.json().catch(() => null)) as { data?: StripeCheckoutSession[] } | null;

    const session = body?.data?.[0];
    if (!session) {
      return { status: 'pending' };
    }
    if (session.payment_status === 'paid') {
      return {
        status: 'success',
        metadata: { stripeSessionId: session.id, amount: session.amount_total }
      };
    }
    if (session.payment_status === 'unpaid' && session.status === 'expired') {
      return { status: 'failed' };
    }
    return { status: 'pending' };
  }

  verifyWebhookSignature(rawBody: string, headers: Record<string, string | string[] | undefined>): boolean {
    const signature = headers['stripe-signature'];
    if (typeof signature !== 'string' || !signature) {
      return false;
    }
    const webhookSecret = this.credentials.webhookSecret;
    if (!webhookSecret) {
      return false;
    }
    // Stripe sends t=...,v1=... components; recompute the HMAC-SHA256 with the
    // raw body and compare the v1 payload using a constant-time check.
    const parts = signature.split(',');
    const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
    const expected = parts.find((p) => p.startsWith('v1='))?.slice(3);
    if (!timestamp || !expected) {
      return false;
    }
    const signed = `${timestamp}.${rawBody}`;
    const actual = createHmac('sha256', webhookSecret).update(signed).digest('hex');
    const a = Buffer.from(actual, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
  }

  async refund(reference: string, amount: number): Promise<void> {
    // Refunds need the PaymentIntent, not the checkout session. Look up the
    // session by client_reference_id, expand the payment_intent, then refund it.
    const url = `${API_BASE}/checkout/sessions?limit=1&client_reference_id=${encodeURIComponent(reference)}&expand%5B%5D=data.payment_intent`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.secretKey}` }
    });
    const body = (await response.json().catch(() => null)) as {
      data?: (StripeCheckoutSession & { payment_intent?: string | { id?: string } })[];
    } | null;

    const session = body?.data?.[0];
    const paymentIntent =
      typeof session?.payment_intent === 'string'
        ? session.payment_intent
        : (session?.payment_intent as { id?: string } | undefined)?.id;
    if (!paymentIntent) {
      throw new Error('Stripe refund failed: payment intent not found.');
    }

    const result = await this.formRequest('/refunds', {
      payment_intent: paymentIntent,
      amount: Math.round(amount * 100)
    });
    if (!result.ok) {
      throw new Error(`Stripe refund failed (${result.status}).`);
    }
  }
}
