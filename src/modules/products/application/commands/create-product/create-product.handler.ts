import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { CreateProductCommand } from './create-product.command.js';
import type { ProductService } from '../../services/product.service.js';
import type { ProductWithRelations } from '../../../domain/types/product.types.js';

export class CreateProductHandler implements CommandHandler<CreateProductCommand, ProductWithRelations> {
  readonly commandName = CreateProductCommand.name;

  constructor(private readonly productService: ProductService) {}

  handle(command: CreateProductCommand): Promise<ProductWithRelations> {
    return this.productService.create(command.input);
  }
}
