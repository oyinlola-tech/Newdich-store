import { createHash, randomBytes, randomUUID } from 'node:crypto';

export function generateId(): string {
  return randomUUID();
}

export function generateNumericCode(length = 6): string {
  const max = Math.pow(10, length);
  return String(Math.floor(Math.random() * max)).padStart(length, '0');
}

export function generateSecretToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
