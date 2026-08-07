import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export function createPrismaClient(): PrismaClient {
  const client =
    globalThis.__prisma ??
    new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error']
    });

  if (!globalThis.__prisma) {
    globalThis.__prisma = client;
  }
  return client;
}

export type Prisma = PrismaClient;
