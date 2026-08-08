import type { PaymentGateway, GatewayCredentials, InitializeResult, VerificationResult, TransferAccount } from './payment-gateway.types.js';

const API_BASE = 'https://api.flutterwave.com/v3';

interface FlutterwaveInitResponse {
  status?: string;
  message?: string;
  data?: { link?: string; tx_ref?: string };
}

interface FlutterwaveVerifyResponse {
  status?: string;
  message?: string;
  data?: {
    id?: number;
    tx_ref?: string;
    status?: string;
    amount?: number;
    currency?: string;
    paid_at?: string;
    created_at?: string;
    payment_type?: string;
  };
}

interface FlutterwaveVirtualAccountResponse {
  status?: string;
  message?: string;
  data?: {
    account_number?: string;
    bank_name?: string;
    account_name?: string;
    reference?: string;
    amount?: number;
    frequency?: string;
  };
}

export class FlutterwaveGateway implements PaymentGateway {
  readonly name = 'flutterwave' as const;
  readonly inlineScriptUrl = 'https://checkout.flutterwave.com/v3.js';

  constructor(private readonly credentials: GatewayCredentials) {}

  private get secretKey(): string {
    if (!this.credentials.secretKey) {
      throw new Error('Flutterwave secret key is not configured.');
    }
    return this.credentials.secretKey;
  }

  private get publicKey(): string {
    if (!this.credentials.publicKey) {
      throw new Error('Flutterwave public key is not configured.');
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
    const common = {
      tx_ref: input.reference,
      amount: input.amount,
      currency: input.currency ?? 'NGN',
      email: input.email,
      meta: { orderNumber: input.orderNumber }
    };

    let transferAccount: TransferAccount | undefined;
    if (input.method === 'TRANSFER') {
      // Flutterwave virtual account — bank account details for the customer to transfer into.
      const vaResult = await this.request('/virtual-account-numbers', {
        method: 'POST',
        body: JSON.stringify({
          ...common,
          narration: `Payment for order ${input.orderNumber}`,
          is_permanent: false
        })
      });
      const vaBody = vaResult.body as FlutterwaveVirtualAccountResponse | null;
      const va = vaBody?.data;
      if (va?.account_number && va.bank_name) {
        transferAccount = {
          bank: va.bank_name,
          accountNumber: va.account_number,
          accountName: va.account_name ?? 'Telente Store',
          reference: input.reference
        };
      }
    }

    const result = await this.request('/payments', {
      method: 'POST',
      body: JSON.stringify({
        ...common,
        customer: { email: input.email, name: 'Telente Customer' },
        customizations: { title: 'Telente Store' }
      })
    });

    if (!result.ok) {
      throw new Error(`Flutterwave initialize failed (${result.status}).`);
    }
    const data = (result.body as FlutterwaveInitResponse).data;
    if (!data) {
      throw new Error('Flutterwave initialize returned no data.');
    }

    return {
      reference: data.tx_ref ?? input.reference,
      inline: {
        scriptUrl: this.inlineScriptUrl,
        publicKey: this.publicKey,
        reference: data.tx_ref ?? input.reference
      },
      redirectUrl: data.link,
      transferAccount
    };
  }

  async verify(reference: string): Promise<VerificationResult> {
    const result = await this.request(
      `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`
    );
    if (!result.ok) {
      return { status: 'failed' };
    }
    const data = (result.body as FlutterwaveVerifyResponse).data;
    if (!data) {
      return { status: 'failed' };
    }
    if (data.status === 'successful') {
      return {
        status: 'success',
        paidAt: data.paid_at ? new Date(data.paid_at) : null,
        metadata: { transactionId: data.id, amount: data.amount, currency: data.currency, paymentType: data.payment_type }
      };
    }
    return { status: data.status === 'failed' || data.status === 'cancelled' ? 'failed' : 'pending' };
  }

  verifyWebhookSignature(_rawBody: string, headers: Record<string, string | string[] | undefined>): boolean {
    // Flutterwave v3: dashboard-configured secret hash is sent as the `verif-hash` header.
    const verifHash = headers['verif-hash'];
    if (typeof verifHash !== 'string' || !verifHash) {
      return false;
    }
    if (!this.credentials.webhookSecret) {
      return false;
    }
    return verifHash === this.credentials.webhookSecret;
  }

  async refund(reference: string, amount: number): Promise<void> {
    // Fetch the transaction id first, then issue the refund against it.
    const verifyResult = await this.request(
      `/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`
    );
    const data = (verifyResult.body as FlutterwaveVerifyResponse)?.data;
    if (!data?.id) {
      throw new Error('Flutterwave refund failed: transaction not found.');
    }
    const result = await this.request('/refunds', {
      method: 'POST',
      body: JSON.stringify({ id: data.id, amount })
    });
    if (!result.ok) {
      throw new Error(`Flutterwave refund failed (${result.status}).`);
    }
  }
}
