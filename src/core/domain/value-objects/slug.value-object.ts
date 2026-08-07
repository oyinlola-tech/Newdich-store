import { DomainError } from '../errors/domain.error.js';

export class SlugValueObject {
  private constructor(readonly value: string) {}

  static create(raw: string): SlugValueObject {
    const slug = toSlug(raw);
    if (!slug) {
      throw new DomainError('INVALID_SLUG', 'Could not generate a slug from the provided value.');
    }
    return new SlugValueObject(slug);
  }
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
