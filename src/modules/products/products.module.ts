import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaProductRepository } from './infrastructure/repositories/prisma-product.repository.js';
import { ProductService } from './application/services/product.service.js';
import { CreateProductHandler } from './application/commands/create-product/create-product.handler.js';
import { UpdateProductHandler } from './application/commands/update-product/update-product.handler.js';
import { DeleteProductHandler } from './application/commands/delete-product/delete-product.handler.js';
import { PublishProductHandler } from './application/commands/publish-product/publish-product.handler.js';
import { ArchiveProductHandler } from './application/commands/archive-product/archive-product.handler.js';
import { GetProductHandler } from './application/queries/get-product/get-product.handler.js';
import { GetProductsHandler } from './application/queries/get-products/get-products.handler.js';
import { SearchProductsHandler } from './application/queries/search-products/search-products.handler.js';
import { ProductController } from './presentation/controllers/product.controller.js';
import { registerProductRoutes } from './presentation/routes/product.route.js';import { CommandBus } from '../../core/application/commands/command-bus.js';
import { QueryBus } from '../../core/application/queries/query-bus.js';

export function registerProductsModule(container: Container, app: FastifyInstance): void {
  container.register('product.repository', (c) => new PrismaProductRepository(c.get('prisma')));
  container.register('product.service', (c) =>
    new ProductService(c.get('product.repository'), c.get('category.repository'), c.get('brand.repository'))
  );
  container.register('product.controller', (c) =>
    new ProductController(
      c.get('command.bus'),
      c.get('query.bus'),
      c.get('media.service'),
      c.get('category.repository')
    )
  );

  const productService = container.get<ProductService>('product.service');

  container.get<CommandBus>('command.bus')
    .register(new CreateProductHandler(productService))
    .register(new UpdateProductHandler(productService))
    .register(new DeleteProductHandler(productService))
    .register(new PublishProductHandler(productService))
    .register(new ArchiveProductHandler(productService));

  container.get<QueryBus>('query.bus')
    .register(new GetProductHandler(productService))
    .register(new GetProductsHandler(productService))
    .register(new SearchProductsHandler(productService));

  registerProductRoutes(app, container);
}
