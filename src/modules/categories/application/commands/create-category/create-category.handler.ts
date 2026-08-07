import type { CommandHandler } from '../../../../../core/application/commands/command.js';
import { CreateCategoryCommand } from './create-category.command.js';
import type { CategoryService } from '../../services/category.service.js';
import type { Category } from '@prisma/client';

export class CreateCategoryHandler implements CommandHandler<CreateCategoryCommand, Category> {
  readonly commandName = CreateCategoryCommand.name;

  constructor(private readonly categoryService: CategoryService) {}

  handle(command: CreateCategoryCommand): Promise<Category> {
    return this.categoryService.create(command.dto);
  }
}
