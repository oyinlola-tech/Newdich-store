import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../../domain/errors/app.error.js';
import type { AppLogger } from '../logger/logger.service.js';

export function registerErrorHandler(app: FastifyInstance, logger: AppLogger): void {
  app.setErrorHandler(async (error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof AppError) {
      logger.warn({ code: error.code, statusCode: error.statusCode, message: error.message }, 'handled error');
      return reply.status(error.statusCode).send(error.toResponse());
    }

    if (error.name === 'SyntaxError' && 'statusCode' in error && error.statusCode === 400) {
      return reply.status(400).send({
        error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' }
      });
    }

    logger.error(error, 'unhandled error');
    return reply.status(500).send({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong. Please try again later.' }
    });
  });
}
