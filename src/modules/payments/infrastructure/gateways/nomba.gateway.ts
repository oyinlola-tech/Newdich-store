import { createHmac, timingSafeEqual } from 'node:crypto';
import type { PaymentGateway, GatewayCredentials, InitializeResult, VerificationResult, TransferAccount } from './payment-gateway.types.js';

const API_BASE = 'https://api.nomba.com';
const SANDBOX_BASE = 'https://sandbox.nomba.com';

interface NombaVirtualAccountRequest {
  accountRef: string;
  accountName: string;
  currency: string;
  expectedAmount: number;
  expiryDate?: string;
}

interface NombaVirtualAccountResponse {
  code?: string;
  description?: string;
  data?: {
    bankAccountNumber?: string;
    bankName?: string;
    bankAccountName?: string;
    accountName?: string;
    accountRef?: string;
  };
}

interface NombaVerifyResponse {
  code?: string;
  description?: string;
  data?: { status?: string };
}

export class NombaGateway implements PaymentGateway {
  readonly name = 'nomba' as const;
  readonly inlineScriptUrl = 'https://www.nomba.com/checkout/sdk/v1/nomba-inline.js';

  constructor(private readonly credentials: GatewayCredentials) {}

  private get apiKey(): string {
    if (!this.credentials.secretKey) {
      throw new Error('Nomba API key is not configured.');
    }
    return this.credentials.secretKey;
  }

  private get accountId(): string {
    if (!this.credentials.accountId) {
      throw new Error('Nomba account ID is not configured.');
    }
    return this.credentials.accountId;
  }

  private baseUrl(sandbox = false): string {
    return sandbox ? SANDBOX_BASE : API_BASE;
  }

  private async request(path: string, init: RequestInit = {}, sandbox = false): Promise<{ ok: boolean; status: number; body: unknown }> {
    const response = await fetch(`${this.baseUrl(sandbox)}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'accountId': this.accountId,
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
    const body: NombaVirtualAccountRequest = {
      accountRef: input.reference,
      accountName: `Telente-${input.orderNumber.slice(0, 8).toUpperCase()}`,
      currency: input.currency ?? 'NGN',
      expectedAmount: input.amount
    };

    const result = await this.request('/v1/accounts/virtual', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    let transferAccount: TransferAccount | undefined;
    const data = (result.body as NombaVirtualAccountResponse)?.data;
    if (data?.bankAccountNumber) {
      transferAccount = {
        bank: data.bankName ?? 'Nomba',
        accountNumber: data.bankAccountNumber,
        accountName: data.bankAccountName ?? data.accountName ?? 'Telente Store',
        reference: data.accountRef ?? input.reference
      };
    }

    if (!result.ok && !transferAccount) {
      throw new Error(`Nomba virtual account failed (${result.status}).`);
    }

    return {
      reference: input.reference,
      redirectUrl: transferAccount ? undefined : `${API_BASE}/checkout?reference=${input.reference}`,
      transferAccount
    };
  }

  async verify(reference: string): Promise<VerificationResult> {
    const result = await this.request(`/v1/transactions/accounts/single?orderReference=${encodeURIComponent(reference)}`);
    if (!result.ok) {
      return { status: 'failed' };
    }
    const status = (result.body as NombaVerifyResponse)?.data?.status;
    if (status === 'SUCCESS') {
      return { status: 'success' };
    }
    return { status: status === 'FAILED' || status === 'CANCELLED' ? 'failed' : 'pending' };
  }

  verifyWebhookSignature(rawBody: string, headers: Record<string, string | string[] | undefined>): boolean {
    // Nomba: the signature is HMAC-SHA256 (base64) of a constructed payload
    // string, signed with the webhook signature key.
    //   payload = "{event_type}:{requestId}:{merchant.userId}:{merchant.walletId}:
    //              {transaction.transactionId}:{transaction.type}:
    //              {transaction.time}:{transaction.responseCode}:{nomba-timestamp}"
    const signature = headers['nomba-signature'];
    const timestamp = headers['nomba-timestamp'];
    if (typeof signature !== 'string' || !signature) {
      return false;
    }
    if (!this.credentials.webhookSecret) {
      return false;
    }

    try {
      const payload = JSON.parse(rawBody) as {
        event_type?: string;
        requestId?: string;
        data?: {
          merchant?: { userId?: string; walletId?: string };
          transaction?: {
            transactionId?: string;
            type?: string;
            time?: string;
            responseCode?: string | null;
          };
        };
      };
      const transaction = payload.data?.transaction ?? {};
      const responseCode = transaction.responseCode === null || transaction.responseCode === undefined ? '' : transaction.responseCode;
      const hashingPayload = [
        payload.event_type ?? '',
        payload.requestId ?? '',
        payload.data?.merchant?.userId ?? '',
        payload.data?.merchant?.walletId ?? '',
        transaction.transactionId ?? '',
        transaction.type ?? '',
        transaction.time ?? '',
        responseCode,
        typeof timestamp === 'string' ? timestamp : ''
      ].join(':');

      const expected = createHmac('sha256', this.credentials.webhookSecret).update(hashingPayload).digest('base64');
      const a = Buffer.from(signature, 'utf8');
      const b = Buffer.from(expected, 'utf8');
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  async refund(_reference: string, _amount: number): Promise<void> {
    throw new Error('Nomba refunds must be processed from the Nomba dashboard.');
  }
}
