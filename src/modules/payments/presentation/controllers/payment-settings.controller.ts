import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { PaymentSettingsService } from '../../application/services/payment-settings.service.js';
import { PinError } from '../../application/services/pin.service.js';

const PinSchema = z.object({ pin: z.string().min(1, 'pin is required') });
const CreatePinSchema = z.object({ pin: z.string().min(1), confirmPin: z.string().min(1) }).refine((d) => d.pin === d.confirmPin, { message: 'pin and confirmPin must match', path: ['confirmPin'] });
const ChangePinSchema = z.object({ currentPin: z.string().min(1), newPin: z.string().min(1), confirmPin: z.string().min(1) }).refine((d) => d.newPin === d.confirmPin, { message: 'newPin and confirmPin must match', path: ['confirmPin'] });
const ProviderParamSchema = z.object({ provider: z.enum(['paystack', 'flutterwave', 'nomba', 'stripe']) });
const SaveProviderSchema = z.object({ enabled: z.boolean().optional(), publicKey: z.string().optional(), secretKey: z.string().optional(), webhookSecret: z.string().optional(), accountId: z.string().optional(), pin: z.string().min(1) });
const ToggleProviderSchema = z.object({ enabled: z.boolean(), pin: z.string().min(1) });
const RevealSecretParamSchema = z.object({ provider: z.enum(['paystack', 'flutterwave', 'nomba', 'stripe']), field: z.enum(['publicKey', 'secretKey', 'webhookSecret', 'accountId']) });

export class PaymentSettingsController {
  constructor(private readonly settingsService: PaymentSettingsService) {}

  async status(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      pinSet: await this.settingsService.isPinSet(),
      unlocked: this.settingsService.isUnlocked()
    });
  }

  async createPin(request: FastifyRequest, reply: FastifyReply) {
    const body = CreatePinSchema.parse(request.body);
    try {
      await this.settingsService.createPin(body.pin);
      return reply.status(201).send({ message: 'Pin created.' });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(400).send({ message: error.message });
      }
      throw error;
    }
  }

  async changePin(request: FastifyRequest, reply: FastifyReply) {
    const body = ChangePinSchema.parse(request.body);
    try {
      await this.settingsService.changePin(body.currentPin, body.newPin);
      return reply.send({ message: 'Pin changed. Payment settings are now locked; unlock with the new pin.' });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(400).send({ message: error.message });
      }
      throw error;
    }
  }

  async providers(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ providers: await this.settingsService.getProviders() });
  }

  async saveProvider(request: FastifyRequest, reply: FastifyReply) {
    const { provider } = ProviderParamSchema.parse(request.params);
    const body = SaveProviderSchema.parse(request.body);
    try {
      await this.settingsService.saveProvider(provider, body, body.pin);
      return reply.send({ message: 'Provider saved.' });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(401).send({ message: error.message });
      }
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async toggleProvider(request: FastifyRequest, reply: FastifyReply) {
    const { provider } = ProviderParamSchema.parse(request.params);
    const body = ToggleProviderSchema.parse(request.body);
    try {
      await this.settingsService.toggleProvider(provider, body.enabled, body.pin);
      return reply.send({ message: `Provider ${body.enabled ? 'enabled' : 'disabled'}.` });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(401).send({ message: error.message });
      }
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async removeProvider(request: FastifyRequest, reply: FastifyReply) {
    const { provider } = ProviderParamSchema.parse(request.params);
    const body = PinSchema.parse(request.body);
    try {
      await this.settingsService.removeProvider(provider, body.pin);
      return reply.send({ message: 'Provider removed.' });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(401).send({ message: error.message });
      }
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async revealSecret(request: FastifyRequest, reply: FastifyReply) {
    const { provider, field } = RevealSecretParamSchema.parse(request.params);
    const body = PinSchema.parse(request.body);
    try {
      const value = await this.settingsService.revealSecret(provider, field, body.pin);
      return reply.send({ value });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(401).send({ message: error.message });
      }
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async unlock(request: FastifyRequest, reply: FastifyReply) {
    const body = PinSchema.parse(request.body);
    try {
      const result = await this.settingsService.unlock(body.pin);
      return reply.send({ message: 'Unlocked.', expiresAt: result.expiresAt });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(401).send({ message: error.message });
      }
      throw error;
    }
  }

  async lock(_request: FastifyRequest, reply: FastifyReply) {
    this.settingsService.lock();
    return reply.send({ message: 'Locked.' });
  }
}
