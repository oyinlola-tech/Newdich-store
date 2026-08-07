import type { FastifyReply, FastifyRequest } from 'fastify';
import { CommandBus } from '../../../../core/application/commands/command-bus.js';
import { QueryBus } from '../../../../core/application/queries/query-bus.js';
import { parseBody } from '../../../../core/infrastructure/http/parse.js';
import { CreateCategoryCommand } from '../../application/commands/create-category/create-category.command.js';
import { UpdateCategoryCommand } from '../../application/commands/update-category/update-category.command.js';
import { DeleteCategoryCommand } from '../../application/commands/delete-category/delete-category.command.js';
import { GetCategoriesQuery } from '../../application/queries/get-categories/get-categories.query.js';
import { GetCategoryQuery } from '../../application/queries/get-category/get-category.query.js';
import { GetCategoryTreeQuery } from '../../application/queries/get-category-tree/get-category-tree.query.js';
import { createCategoryValidator, updateCategoryValidator } from '../validators/category.validator.js';
import { toCategoryOutput } from '../serializers/category.serializer.js';

export class CategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async listPublic(_request: FastifyRequest, reply: FastifyReply) {
    const categories = await this.queryBus.execute(new GetCategoriesQuery());
    return reply.send({ categories: categories.map(toCategoryOutput) });
  }

  async listAdmin(_request: FastifyRequest, reply: FastifyReply) {
    const categories = await this.queryBus.execute(new GetCategoriesQuery(true));
    return reply.send({ categories: categories.map(toCategoryOutput) });
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { idOrSlug } = request.params as { idOrSlug: string };
    const category = await this.queryBus.execute(new GetCategoryQuery(idOrSlug));
    return reply.send({ category: toCategoryOutput(category) });
  }

  async tree(_request: FastifyRequest, reply: FastifyReply) {
    const tree = await this.queryBus.execute(new GetCategoryTreeQuery());
    return reply.send({ tree });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(createCategoryValidator, request.body);
    const category = await this.commandBus.execute(new CreateCategoryCommand(dto));
    return reply.status(201).send({ category: toCategoryOutput(category) });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const dto = parseBody(updateCategoryValidator, request.body);
    const category = await this.commandBus.execute(new UpdateCategoryCommand(id, dto));
    return reply.send({ category: toCategoryOutput(category) });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await this.commandBus.execute(new DeleteCategoryCommand(id));
    return reply.send({ message: 'Category deleted successfully.' });
  }
}
