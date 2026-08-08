import type { FastifyReply, FastifyRequest } from 'fastify';
import type { PaymentSettingsService, PaymentProviderName } from '../../application/services/payment-settings.service.js';
import { PinError } from '../../application/services/pin.service.js';

export class PaymentSettingsController {
  constructor(private readonly settingsService: PaymentSettingsService) {}

  async status(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      pinSet: await this.settingsService.isPinSet(),
      unlocked: this.settingsService.isUnlocked()
    });
  }

  async createPin(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { pin?: string; confirmPin?: string };
    if (!body.pin || body.pin !== body.confirmPin) {
      return reply.status(400).send({ message: 'pin and confirmPin are required and must match.' });
    }
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
    const body = request.body as { currentPin?: string; newPin?: string; confirmPin?: string };
    if (!body.currentPin || !body.newPin || body.newPin !== body.confirmPin) {
      return reply.status(400).send({ message: 'currentPin, newPin and confirmPin are required; newPin must match confirmPin.' });
    }
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
    const { provider } = request.params as { provider: string };
    const body = request.body as {
      enabled?: boolean;
      publicKey?: string;
      secretKey?: string;
      webhookSecret?: string;
      accountId?: string;
      pin?: string;
    };
    if (!body.pin) {
      return reply.status(400).send({ message: 'pin is required to save provider credentials.' });
    }
    try {
      await this.settingsService.saveProvider(provider as PaymentProviderName, body, body.pin);
      return reply.send({ message: 'Provider saved.' });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(401).send({ message: error.message });
      }
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async toggleProvider(request: FastifyRequest, reply: FastifyReply) {
    const { provider } = request.params as { provider: string };
    const body = request.body as { enabled?: boolean; pin?: string };
    if (typeof body.enabled !== 'boolean' || !body.pin) {
      return reply.status(400).send({ message: 'enabled and pin are required.' });
    }
    try {
      await this.settingsService.toggleProvider(provider as PaymentProviderName, body.enabled, body.pin);
      return reply.send({ message: `Provider ${body.enabled ? 'enabled' : 'disabled'}.` });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(401).send({ message: error.message });
      }
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async removeProvider(request: FastifyRequest, reply: FastifyReply) {
    const { provider } = request.params as { provider: string };
    const body = request.body as { pin?: string };
    if (!body.pin) {
      return reply.status(400).send({ message: 'pin is required.' });
    }
    try {
      await this.settingsService.removeProvider(provider as PaymentProviderName, body.pin);
      return reply.send({ message: 'Provider removed.' });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(401).send({ message: error.message });
      }
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async revealSecret(request: FastifyRequest, reply: FastifyReply) {
    const { provider, field } = request.params as { provider: string; field: string };
    const body = request.body as { pin?: string };
    if (!body.pin) {
      return reply.status(400).send({ message: 'pin is required.' });
    }
    try {
      const value = await this.settingsService.revealSecret(
        provider as PaymentProviderName,
        field as 'publicKey' | 'secretKey' | 'webhookSecret' | 'accountId',
        body.pin
      );
      return reply.send({ value });
    } catch (error) {
      if (error instanceof PinError) {
        return reply.status(401).send({ message: error.message });
      }
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async unlock(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { pin?: string };
    if (!body.pin) {
      return reply.status(400).send({ message: 'pin is required.' });
    }
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
