export interface PaystackInitTransactionInput {
  amountKobo: number;
  email: string;
  reference: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitTransactionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackVerifyResponse {
  status: string;
  reference: string;
  amount: number;
  paid_at: string | null;
  channel: string | null;
}

export class PaystackClient {
  constructor(private readonly secretKey: string) {}

  async initializeTransaction(
    input: PaystackInitTransactionInput
  ): Promise<PaystackInitTransactionResponse> {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error(`Paystack initialize failed: ${response.status}`);
    }

    const body = (await response.json()) as {
      data?: PaystackInitTransactionResponse;
      message?: string;
    };

    if (!body.data) {
      throw new Error(`Paystack initialize failed: ${body.message}`);
    }

    return body.data;
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse | null> {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` }
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as { data?: PaystackVerifyResponse };
    return body.data ?? null;
  }
}
