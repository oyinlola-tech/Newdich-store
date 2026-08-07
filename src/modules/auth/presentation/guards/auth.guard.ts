import type { FastifyRequest } from 'fastify';
import type { Container } from '../../../../app/container.js';
import type { TokenService } from '../../infrastructure/security/token.service.js';
import { UnauthorizedError } from '../../../../core/domain/errors/domain.error.js';
import {
  extractBearerToken,
  type AuthenticatedUser
} from '../../../../core/infrastructure/http/request.types.js';

export function requireAuth(tokenService: TokenService) {
  return async function authGuard(request: FastifyRequest): Promise<void> {
    const token = extractBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedError();
    }

    const payload = tokenService.verify<{ sub: string; role: AuthenticatedUser['role']; type: string; email: string; status: AuthenticatedUser['status'] }>(token);

    if (!payload.sub || !payload.role || payload.type !== 'access') {
      throw new UnauthorizedError('Invalid access token');
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      status: payload.status
    };
  };
}

export function authenticate(container: Container) {
  return requireAuth(container.get<TokenService>('token.service'));
}
