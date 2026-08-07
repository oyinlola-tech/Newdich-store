import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { UpdateProductCommand } from './update-product.command.js';
import type { ProductService } from '../../services/product.service.js';
import type { ProductWithRelations } from '../../../domain/types/product.types.js';

export class UpdateProductHandler implements CommandHandler<UpdateProductCommand, ProductWithRelations> {
  readonly commandName = UpdateProductCommand.name;

  constructor(private readonly productService: ProductService) {}

  handle(command: UpdateProductCommand): Promise<ProductWithRelations> {
    return this.productService.update(command.productId, command.input);
  }
}
