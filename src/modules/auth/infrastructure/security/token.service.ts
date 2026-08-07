import jwt, { type SignOptions } from 'jsonwebtoken';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  type: 'access';
  email: string;
  status: string;
}

export class TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as SignOptions['expiresIn'] });
  }

  verify<T extends object = Record<string, unknown>>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }
}
