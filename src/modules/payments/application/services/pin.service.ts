import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';

const PIN_PATTERN = /^\d{4}$|^\d{6}$/;
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

export class PinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PinError';
  }
}

export class PinService {
  static isValidPin(pin: string): boolean {
    return PIN_PATTERN.test(pin);
  }

  static assertValidPin(pin: string): void {
    if (!PIN_PATTERN.test(pin)) {
      throw new PinError('Pin must be exactly 4 or 6 digits.');
    }
  }

  static async hashPin(pin: string): Promise<string> {
    return bcrypt.hash(pin, 12);
  }

  static async verifyPin(hash: string, pin: string): Promise<boolean> {
    return bcrypt.compare(pin, hash);
  }

  static encryptWithPin(pin: string, plaintext: string): string {
    const salt = randomBytes(16);
    const iv = randomBytes(IV_LENGTH);
    const key = scryptSync(pin, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [
      salt.toString('base64'),
      iv.toString('base64'),
      tag.toString('base64'),
      encrypted.toString('base64')
    ].join(':');
  }

  static decryptWithPin(pin: string, blob: string): string {
    const [saltB64, ivB64, tagB64, dataB64] = blob.split(':');
    if (!saltB64 || !ivB64 || !tagB64 || !dataB64) {
      throw new PinError('Encrypted payload is malformed.');
    }
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const key = scryptSync(pin, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    try {
      return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
    } catch {
      throw new PinError('Wrong pin. Could not decrypt secrets.');
    }
  }

  static secureEquals(a: string, b: string): boolean {
    const ba = Buffer.from(a, 'utf8');
    const bb = Buffer.from(b, 'utf8');
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  }
}
