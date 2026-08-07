import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { ArchiveProductCommand } from './archive-product.command.js';
import type { ProductService } from '../../services/product.service.js';
import type { ProductWithRelations } from '../../../domain/types/product.types.js';

export class ArchiveProductHandler implements CommandHandler<ArchiveProductCommand, ProductWithRelations> {
  readonly commandName = ArchiveProductCommand.name;

  constructor(private readonly productService: ProductService) {}

  handle(command: ArchiveProductCommand): Promise<ProductWithRelations> {
    return this.productService.archive(command.productId);
  }
}
