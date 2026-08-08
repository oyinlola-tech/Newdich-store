import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppError } from '../../domain/errors/app.error.js';
import { wantsHtml } from '../../../app/static-routes.js';
import type { AppLogger } from '../logger/logger.service.js';

const PUBLIC_DIR = join(process.cwd(), 'public');

const STATUS_TO_ERROR_PAGE: Record<number, string> = {
  400: 'errors/400.html',
  401: 'errors/401.html',
  403: 'errors/403.html',
  404: 'errors/404.html',
  405: 'errors/405.html',
  429: 'errors/429.html',
  500: 'errors/500.html',
  502: 'errors/502.html',
  503: 'errors/503.html',
  504: 'errors/504.html'
};

function getErrorFile(statusCode: number, request: FastifyRequest): string {
  const isAdminRoute = request.url.startsWith('/admin');
  const pageFile = STATUS_TO_ERROR_PAGE[statusCode] ?? 'errors/500.html';
  return isAdminRoute ? `admins/${pageFile}` : pageFile;
}

function serveHtmlError(statusCode: number, request: FastifyRequest, reply: FastifyReply): void {
  const errorFile = getErrorFile(statusCode, request);
  reply.code(statusCode).type('text/html');
  try {
    const html = readFileSync(join(PUBLIC_DIR, errorFile), 'utf-8');
    reply.send(html);
  } catch {
    reply.send(`<h1>${statusCode}</h1><p>${request.method} ${request.url}</p>`);
  }
}

export function registerErrorHandler(app: FastifyInstance, logger: AppLogger): void {
  app.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof AppError) {
      logger.warn({ code: error.code, statusCode: error.statusCode, message: error.message }, 'handled error');

      if (wantsHtml(request)) {
        serveHtmlError(error.statusCode, request, reply);
        return;
      }

      return reply.status(error.statusCode).send(error.toResponse());
    }

    if (error.name === 'SyntaxError' && 'statusCode' in error && error.statusCode === 400) {
      if (wantsHtml(request)) {
        serveHtmlError(400, request, reply);
        return;
      }
      return reply.status(400).send({
        error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' }
      });
    }

    logger.error(error, 'unhandled error');

    if (wantsHtml(request)) {
      serveHtmlError(500, request, reply);
      return;
    }

    return reply.status(500).send({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong. Please try again later.' }
    });
  });
}
