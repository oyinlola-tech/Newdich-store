import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaCategoryRepository } from './infrastructure/repositories/prisma-category.repository.js';
import { CategoryService } from './application/services/category.service.js';
import { CategoryController } from './presentation/controllers/category.controller.js';
import { registerCategoryRoutes } from './presentation/routes/category.route.js';
import { CommandBus } from '../../core/application/commands/command-bus.js';
import { QueryBus } from '../../core/application/queries/query-bus.js';
import { CreateCategoryHandler } from './application/commands/create-category/create-category.handler.js';
import { UpdateCategoryHandler } from './application/commands/update-category/update-category.handler.js';
import { DeleteCategoryHandler } from './application/commands/delete-category/delete-category.handler.js';
import { ReorderCategoryHandler } from './application/commands/reorder-category/reorder-category.handler.js';
import { GetCategoriesHandler } from './application/queries/get-categories/get-categories.handler.js';
import { GetCategoryHandler } from './application/queries/get-category/get-category.handler.js';
import { GetCategoryTreeHandler } from './application/queries/get-category-tree/get-category-tree.handler.js';

export function registerCategoriesModule(container: Container, app: FastifyInstance): void {
  container.register('category.repository', (c) => new PrismaCategoryRepository(c.get('prisma')));
  container.register('category.service', (c) => new CategoryService(c.get('category.repository')));
  container.register('category.controller', (c) =>
    new CategoryController(c.get('command.bus'), c.get('query.bus'))
  );

  const commandBus = container.get<CommandBus>('command.bus');
  const queryBus = container.get<QueryBus>('query.bus');
  const categoryService = container.get<CategoryService>('category.service');

  commandBus
    .register(new CreateCategoryHandler(categoryService))
    .register(new UpdateCategoryHandler(categoryService))
    .register(new DeleteCategoryHandler(categoryService))
    .register(new ReorderCategoryHandler(categoryService));

  queryBus
    .register(new GetCategoriesHandler(categoryService))
    .register(new GetCategoryHandler(categoryService))
    .register(new GetCategoryTreeHandler(categoryService));

  registerCategoryRoutes(app, container);
}
