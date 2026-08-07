import type { PrismaClient } from '@prisma/client';
import { createPrismaClient } from '../core/infrastructure/database/prisma.client.js';

export type { Prisma } from '../core/infrastructure/database/prisma.client.js';

export function getDatabase(): PrismaClient {
  return createPrismaClient();
}
