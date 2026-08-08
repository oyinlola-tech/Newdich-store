import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PaymentGateway, GatewayCredentials, InitializeResult, VerificationResult, TransferAccount } from './payment-gateway.types.js';

const API_BASE = 'https://api.paystack.co';

interface PaystackInitResponse {
  status?: boolean;
  message?: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
    public_key?: string;
    transfer?: {
      bank?: string;
      bank_code?: string;
      account_number?: string;
      account_name?: string;
      reference?: string;
    };
    bank_transfer?: {
      bank?: string;
      bank_code?: string;
      account_number?: string;
      account_name?: string;
    };
  };
}

interface PaystackVerifyResponse {
  status?: boolean;
  data?: {
    status?: string;
    paid_at?: string | null;
    amount?: number;
    channel?: string | null;
    reference?: string;
    fees?: number;
  };
}

export class PaystackGateway implements PaymentGateway {
  readonly name = 'paystack' as const;
  readonly inlineScriptUrl = 'https://js.paystack.co/v1/inline.js';

  constructor(private readonly credentials: GatewayCredentials) {}

  private get secretKey(): string {
    if (!this.credentials.secretKey) {
      throw new Error('Paystack secret key is not configured.');
    }
    return this.credentials.secretKey;
  }

  private get publicKey(): string {
    if (!this.credentials.publicKey) {
      throw new Error('Paystack public key is not configured.');
    }
    return this.credentials.publicKey;
  }

  private async request(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; body: unknown }> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {})
      }
    });
    const body = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, body };
  }

  async initialize(input: {
    amount: number;
    currency: string;
    email: string;
    reference: string;
    method: 'CARD' | 'TRANSFER';
    orderNumber: string;
  }): Promise<InitializeResult> {
    const channels = input.method === 'TRANSFER' ? ['bank_transfer'] : ['card'];

    const result = await this.request('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        amount: Math.round(input.amount * 100),
        email: input.email,
        reference: input.reference,
        currency: input.currency ?? 'NGN',
        channels,
        metadata: { orderNumber: input.orderNumber }
      })
    });

    if (!result.ok) {
      throw new Error(`Paystack initialize failed (${result.status}).`);
    }
    const data = (result.body as PaystackInitResponse).data;
    if (!data) {
      throw new Error('Paystack initialize returned no data.');
    }

    let transferAccount: TransferAccount | undefined;
    if (input.method === 'TRANSFER') {
      const transfer = data.transfer ?? data.bank_transfer;
      if (transfer?.account_number && transfer.bank) {
        transferAccount = {
          bank: transfer.bank,
          accountNumber: transfer.account_number,
          accountName: transfer.account_name ?? 'Telente Store',
          reference: input.reference
        };
      }
    }

    return {
      reference: data.reference ?? input.reference,
      inline: {
        scriptUrl: this.inlineScriptUrl,
        publicKey: this.publicKey,
        reference: data.reference ?? input.reference,
        accessCode: data.access_code
      },
      redirectUrl: data.authorization_url,
      transferAccount
    };
  }

  async verify(reference: string): Promise<VerificationResult> {
    const result = await this.request(`/transaction/verify/${encodeURIComponent(reference)}`);
    if (!result.ok) {
      return { status: 'failed' };
    }
    const data = (result.body as PaystackVerifyResponse).data;
    if (!data) {
      return { status: 'failed' };
    }
    if (data.status === 'success') {
      return {
        status: 'success',
        paidAt: data.paid_at ? new Date(data.paid_at) : null,
        metadata: { amount: data.amount, channel: data.channel, fees: data.fees }
      };
    }
    return { status: data.status === 'failed' || data.status === 'abandoned' ? 'failed' : 'pending' };
  }

  verifyWebhookSignature(rawBody: string, headers: Record<string, string | string[] | undefined>): boolean {
    const signature = headers['x-paystack-signature'];
    if (typeof signature !== 'string' || !signature) {
      return false;
    }
    const expected = createHmac('sha512', this.secretKey).update(rawBody).digest('hex');
    const a = Buffer.from(signature, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
  }

  async refund(reference: string, amount: number): Promise<void> {
    const result = await this.request('/refund', {
      method: 'POST',
      body: JSON.stringify({ transaction: reference, amount: Math.round(amount * 100) })
    });
    if (!result.ok) {
      throw new Error(`Paystack refund failed (${result.status}).`);
    }
  }
}
