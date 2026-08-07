export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  purpose?: string;
  idempotencyKey?: string;
}

export interface EmailPort {
  send(input: SendEmailInput): Promise<{ emailId?: string } | undefined>;
}
