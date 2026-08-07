import type { FastifyReply, FastifyRequest } from 'fastify';
import { CommandBus } from '../../../../core/application/commands/command-bus.js';
import { QueryBus } from '../../../../core/application/queries/query-bus.js';
import { parseBody } from '../../../../core/infrastructure/http/parse.js';
import { buildPagination } from '../../../../core/shared/pagination/pagination.js';
// removed
// import { UserService } from '../../application/services/user.service.js';
import { AdminUpdateUserCommand } from '../../application/commands/admin-update-user/admin-update-user.command.js';
import { GetCustomersQuery } from '../../application/queries/get-customers/get-customers.query.js';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query.js';
import { adminUpdateUserValidator } from '../validators/user.validator.js';
import { toUserOutput } from '../serializers/user.serializer.js';

export class AdminUserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { search?: string; page?: string; limit?: string };
    const { page, limit } = buildPagination(query.page, query.limit, 50);
    const result = await this.queryBus.execute(
      new GetCustomersQuery({ search: query.search?.trim(), page, limit })
    );
    return reply.send({ users: result.users.map(toUserOutput), total: result.total, page, limit });
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = await this.queryBus.execute(new GetUserQuery(id));
    return reply.send({ user: toUserOutput(user) });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const dto = parseBody(adminUpdateUserValidator, request.body);
    const user = await this.commandBus.execute(new AdminUpdateUserCommand(id, dto));
    return reply.send({ user: toUserOutput(user) });
  }
}
