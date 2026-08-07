import { createHash, randomBytes } from 'node:crypto';

export class RefreshTokenValueObject {
  private constructor(readonly rawToken: string, readonly tokenHash: string) {}

  static generate(): RefreshTokenValueObject {
    const rawToken = randomBytes(48).toString('hex');
    return new RefreshTokenValueObject(rawToken, hashToken(rawToken));
  }

  static fromRaw(rawToken: string): RefreshTokenValueObject {
    return new RefreshTokenValueObject(rawToken, hashToken(rawToken));
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
