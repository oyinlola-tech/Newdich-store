import type { FastifyRequest, FastifyReply } from 'fastify';
import { appConfig } from '../../../config/index.js';

interface RateLimitEntry {
  requests: number;
  firstRequest: number;
  captchaRequired: boolean;
  captchaVerified: boolean;
  slowDownUntil: number;
}

const requestCounts = new Map<string, RateLimitEntry>();

export function smartRateLimit() {
  return async function rateLimitMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const isAuthenticated = !!request.user;
    const now = Date.now();
    const windowMs = appConfig.RATE_LIMIT_WINDOW_MS;
    const maxRequests = isAuthenticated ? appConfig.RATE_LIMIT_MAX : Math.floor(appConfig.RATE_LIMIT_MAX / 3);

    let entry = requestCounts.get(ip);
    if (!entry || now - entry.firstRequest > windowMs) {
      entry = { requests: 0, firstRequest: now, captchaRequired: false, captchaVerified: false, slowDownUntil: 0 };
      requestCounts.set(ip, entry);
    }

    if (entry.slowDownUntil > now) {
      const remaining = Math.ceil((entry.slowDownUntil - now) / 1000);
      return reply.status(429).send({
        error: { code: 'RATE_LIMIT_EXCEEDED', message: `Too many requests. Please wait ${remaining} seconds.` }
      });
    }

    if (!isAuthenticated && entry.requests > maxRequests * 0.7 && !entry.captchaVerified) {
      entry.captchaRequired = true;
    }

    entry.requests++;

    if (!isAuthenticated && entry.captchaRequired && entry.requests > maxRequests) {
      const captchaHeader = request.headers['x-captcha-token'];
      if (!captchaHeader) {
        return reply.status(429).send({
          error: { code: 'CAPTCHA_REQUIRED', message: 'CAPTCHA verification required.', captchaRequired: true }
        });
      }
      entry.captchaVerified = true;
      entry.requests = 0;
      entry.firstRequest = now;
    }

    if (entry.requests > maxRequests && isAuthenticated) {
      entry.slowDownUntil = now + 30000;
      return reply.status(429).send({
        error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' }
      });
    }

    if (!isAuthenticated && entry.requests > maxRequests * 0.5 && !entry.captchaVerified) {
      const delay = Math.min((entry.requests - maxRequests * 0.5) * 200, 3000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };
}
