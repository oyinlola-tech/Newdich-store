import type { PaymentProviderName } from '../../application/services/payment-settings.service.js';
import type { GatewayCredentials, PaymentGateway } from './payment-gateway.types.js';
import { PaystackGateway } from './paystack.gateway.js';
import { FlutterwaveGateway } from './flutterwave.gateway.js';
import { NombaGateway } from './nomba.gateway.js';
import { StripeGateway } from './stripe.gateway.js';

export function createGateway(name: PaymentProviderName, credentials: GatewayCredentials): PaymentGateway {
  switch (name) {
    case 'paystack':
      return new PaystackGateway(credentials);
    case 'flutterwave':
      return new FlutterwaveGateway(credentials);
    case 'nomba':
      return new NombaGateway(credentials);
    case 'stripe':
      return new StripeGateway(credentials);
    default:
      throw new Error(`Unsupported payment provider: ${name}`);
  }
}
