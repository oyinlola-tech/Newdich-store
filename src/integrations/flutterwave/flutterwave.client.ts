export class FlutterwaveClient {
  constructor(private readonly secretKey: string) {}

  async initializeTransaction(input: {
    amount: number;
    email: string;
    reference: string;
    currency?: string;
    redirectUrl?: string;
  }): Promise<{ link: string; reference: string }> {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: input.reference,
        amount: input.amount,
        currency: input.currency ?? 'NGN',
        email: input.email,
        redirect_url: input.redirectUrl ?? ''
      })
    });

    if (!response.ok) {
      throw new Error(`Flutterwave initialize failed: ${response.status}`);
    }

    const body = (await response.json()) as {
      data?: { link: string; tx_ref: string };
      message?: string;
    };

    if (!body.data) {
      throw new Error(`Flutterwave initialize failed: ${body.message}`);
    }

    return { link: body.data.link, reference: body.data.tx_ref };
  }
}
