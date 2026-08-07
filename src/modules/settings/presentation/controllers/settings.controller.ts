import type { FastifyReply, FastifyRequest } from 'fastify';
import type { SettingsService } from '../../application/services/settings.service.js';

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  async getPublic(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ settings: await this.settingsService.getPublic() });
  }

  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ settings: await this.settingsService.getAll() });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { key?: string; value?: unknown } | Record<string, unknown>;

    if (body && typeof body === 'object' && 'key' in body && typeof body.key === 'string' && 'value' in body) {
      await this.settingsService.set(body.key, body.value);
      return reply.send({ message: 'Setting updated successfully.' });
    }

    const updates = body as Record<string, unknown>;
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        await this.settingsService.set(key, value);
      }
    }
    return reply.send({ message: 'Settings updated successfully.' });
  }
}
