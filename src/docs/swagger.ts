import type { FastifyInstance } from 'fastify';
import type { OpenAPIV3 } from 'openapi-types';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { openApiDocument } from './openapi.js';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: openApiDocument as unknown as OpenAPIV3.Document<{}>,
    refResolver: { buildLocalReference: (_json, _baseUri, _fragment, i) => `def-${i}` }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs'
  });
}
