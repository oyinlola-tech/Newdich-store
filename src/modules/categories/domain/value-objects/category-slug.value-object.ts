import { SlugValueObject } from '../../../../core/domain/value-objects/slug.value-object.js';

export class CategorySlugValueObject {
  private constructor(readonly value: string) {}

  static create(raw: string): CategorySlugValueObject {
    return new CategorySlugValueObject(SlugValueObject.create(raw).value);
  }
}
