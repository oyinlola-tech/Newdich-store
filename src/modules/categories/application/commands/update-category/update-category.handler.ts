import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { UpdateCategoryCommand } from './update-category.command.js';
import type { CategoryService } from '../../services/category.service.js';
import type { Category } from '@prisma/client';

export class UpdateCategoryHandler implements CommandHandler<UpdateCategoryCommand, Category> {
  readonly commandName = UpdateCategoryCommand.name;

  constructor(private readonly categoryService: CategoryService) {}

  handle(command: UpdateCategoryCommand): Promise<Category> {
    return this.categoryService.update(command.categoryId, command.dto);
  }
}
