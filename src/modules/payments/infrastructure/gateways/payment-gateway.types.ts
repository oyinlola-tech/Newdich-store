import type { PaymentProviderName } from '../../application/services/payment-settings.service.js';

export interface GatewayCredentials {
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  accountId?: string;
}

export interface TransferAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
  reference: string;
}

export interface InitializeResult {
  reference: string;
  inline?: {
    scriptUrl: string;
    publicKey: string;
    reference: string;
    accessCode?: string;
  };
  redirectUrl?: string;
  transferAccount?: TransferAccount;
}

export interface VerificationResult {
  status: 'success' | 'failed' | 'pending';
  paidAt?: Date | null;
  metadata?: Record<string, unknown>;
}

export interface PaymentGateway {
  readonly name: PaymentProviderName;
  /** Dynamically loadable inline JS (popup) script URL. */
  readonly inlineScriptUrl: string;
  initialize(input: {
    amount: number;
    currency: string;
    email: string;
    reference: string;
    method: 'CARD' | 'TRANSFER';
    orderNumber: string;
  }): Promise<InitializeResult>;
  verify(reference: string): Promise<VerificationResult>;
  verifyWebhookSignature(rawBody: string, headers: Record<string, string | string[] | undefined>): boolean;
  refund(reference: string, amount: number): Promise<void>;
}
