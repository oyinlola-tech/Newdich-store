import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../../app/container.js';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAdmin } from '../guards/admin.guard.js';
import type { TokenService } from '../../infrastructure/security/token.service.js';

export function registerAdminAuthRoutes(app: FastifyInstance, container: Container): void {
  const controller = container.get<AuthController>('auth.controller');
  const tokenService = container.get<TokenService>('token.service');

  app.post('/admin/auth/login', { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } }, controller.adminLogin.bind(controller));
  app.post('/admin/auth/otp/request', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, controller.requestOtp.bind(controller));
  app.post('/admin/auth/otp/verify', { config: { rateLimit: { max: 10, timeWindow: '5 minutes' } } }, controller.adminVerifyOtp.bind(controller));
  app.post('/admin/auth/forgot-password', { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } }, controller.forgotPassword.bind(controller));
  app.post('/admin/auth/reset-password', { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } }, controller.resetPassword.bind(controller));

  const adminGuard = requireAdmin(tokenService);
  app.post('/admin/auth/change-password', { preHandler: adminGuard }, controller.changePassword.bind(controller));
  app.post('/admin/auth/logout', { preHandler: adminGuard }, controller.logout.bind(controller));
  app.get('/admin/auth/me', { preHandler: adminGuard }, controller.adminMe.bind(controller));
}
