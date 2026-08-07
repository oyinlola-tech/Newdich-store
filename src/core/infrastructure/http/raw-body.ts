import type { FastifyInstance, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string;
  }
}

export function registerRawBodyJsonParser(app: FastifyInstance): void {
  app.removeContentTypeParser('application/json');
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (request: FastifyRequest, body, done) => {
    try {
      const text = body as string;
      request.rawBody = text;
      done(null, JSON.parse(text));
    } catch (error) {
      done(error as Error);
    }
  });
}

export function getRawBody(request: FastifyRequest): string {
  return request.rawBody ?? JSON.stringify(request.body);
}
