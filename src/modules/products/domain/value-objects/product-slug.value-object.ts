import { SlugValueObject } from '../../../../core/domain/value-objects/slug.value-object.js';

export class ProductSlugValueObject {
  private constructor(readonly value: string) {}

  static create(raw: string): ProductSlugValueObject {
    return new ProductSlugValueObject(SlugValueObject.create(raw).value);
  }
}
