export interface SendByteSendInput {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: string[];
  idempotency_key?: string;
}

export interface SendByteSendResponse {
  id: string;
  status: string;
  sandbox: boolean;
  created_at: string;
}

export class SendByteClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = 'https://api.sendbyte.africa'
  ) {}

  async send(input: SendByteSendInput): Promise<SendByteSendResponse> {
    const response = await fetch(`${this.baseUrl}/v1/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(`SendByte send failed (${response.status}): ${body.message ?? 'unknown error'}`);
    }

    return (await response.json()) as SendByteSendResponse;
  }

  async getEmail(id: string): Promise<Record<string, unknown> | null> {
    const response = await fetch(`${this.baseUrl}/v1/emails/${id}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });
    if (!response.ok) return null;
    return (await response.json()) as Record<string, unknown>;
  }
}
