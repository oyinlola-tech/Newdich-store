export class NombaClient {
  constructor(private readonly apiKey: string) {}

  async initializePayment(input: {
    amount: number;
    email: string;
    reference: string;
  }): Promise<{ link: string; reference: string }> {
    const response = await fetch('https://api.nomba.com/v1/payment-intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: input.amount,
        email: input.email,
        reference: input.reference
      })
    });

    if (!response.ok) {
      throw new Error(`Nomba payment intent failed: ${response.status}`);
    }

    const body = (await response.json()) as { data?: { link: string; reference: string } };
    return body.data ?? { link: '', reference: input.reference };
  }
}
