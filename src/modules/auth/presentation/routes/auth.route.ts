import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../guards/auth.guard.js';
import type { TokenService } from '../../infrastructure/security/token.service.js';

export function registerAuthRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<AuthController>('auth.controller');
  const tokenService = container.get<TokenService>('token.service');

  app.post('/auth/register', { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } }, controller.register.bind(controller));
  app.post('/auth/login', { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } }, controller.login.bind(controller));
  app.post('/auth/otp/request', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, controller.requestOtp.bind(controller));
  app.post('/auth/otp/verify', { config: { rateLimit: { max: 10, timeWindow: '5 minutes' } } }, controller.verifyOtp.bind(controller));
  app.post('/auth/forgot-password', { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } }, controller.forgotPassword.bind(controller));
  app.post('/auth/reset-password', { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } }, controller.resetPassword.bind(controller));
  app.post('/auth/refresh-token', { config: { rateLimit: { max: 10, timeWindow: '5 minutes' } } }, controller.refreshToken.bind(controller));

  const requireCustomerAuth = requireAuth(tokenService);
  app.post('/auth/change-password', { preHandler: requireCustomerAuth }, controller.changePassword.bind(controller));
  app.post('/auth/logout', { preHandler: requireCustomerAuth }, controller.logout.bind(controller));
  app.get('/auth/me', { preHandler: requireCustomerAuth }, controller.me.bind(controller));
}
