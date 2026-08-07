import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { ReorderCategoryCommand } from './reorder-category.command.js';
import type { CategoryService } from '../../services/category.service.js';
import type { Category } from '@prisma/client';

export class ReorderCategoryHandler implements CommandHandler<ReorderCategoryCommand, Category> {
  readonly commandName = ReorderCategoryCommand.name;

  constructor(private readonly categoryService: CategoryService) {}

  handle(command: ReorderCategoryCommand): Promise<Category> {
    return this.categoryService.update(command.categoryId, { sortOrder: command.sortOrder });
  }
}
