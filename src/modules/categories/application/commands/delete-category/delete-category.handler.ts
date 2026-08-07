import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { DeleteCategoryCommand } from './delete-category.command.js';
import type { CategoryService } from '../../services/category.service.js';

export class DeleteCategoryHandler implements CommandHandler<DeleteCategoryCommand, void> {
  readonly commandName = DeleteCategoryCommand.name;

  constructor(private readonly categoryService: CategoryService) {}

  handle(command: DeleteCategoryCommand): Promise<void> {
    return this.categoryService.delete(command.categoryId);
  }
}
