import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { PublishProductCommand } from './publish-product.command.js';
import type { ProductService } from '../../services/product.service.js';
import type { ProductWithRelations } from '../../../domain/types/product.types.js';

export class PublishProductHandler implements CommandHandler<PublishProductCommand, ProductWithRelations> {
  readonly commandName = PublishProductCommand.name;

  constructor(private readonly productService: ProductService) {}

  handle(command: PublishProductCommand): Promise<ProductWithRelations> {
    return this.productService.publish(command.productId);
  }
}
