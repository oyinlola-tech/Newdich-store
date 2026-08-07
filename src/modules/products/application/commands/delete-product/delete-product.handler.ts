import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { DeleteProductCommand } from './delete-product.command.js';
import type { ProductService } from '../../services/product.service.js';

export class DeleteProductHandler implements CommandHandler<DeleteProductCommand, void> {
  readonly commandName = DeleteProductCommand.name;

  constructor(private readonly productService: ProductService) {}

  handle(command: DeleteProductCommand): Promise<void> {
    return this.productService.remove(command.productId);
  }
}
