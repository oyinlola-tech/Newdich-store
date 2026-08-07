import type { FastifyReply, FastifyRequest } from 'fastify';
import { CommandBus } from '../../../../core/application/commands/command-bus.js';
import { QueryBus } from '../../../../core/application/queries/query-bus.js';
import { parseBody } from '../../../../core/infrastructure/http/parse.js';
import { UserService } from '../../application/services/user.service.js';
import { UpdateProfileCommand } from '../../application/commands/update-profile/update-profile.command.js';
import { GetUserQuery } from '../../application/queries/get-user/get-user.query.js';
import { updateProfileValidator } from '../validators/user.validator.js';
import { toUserOutput } from '../serializers/user.serializer.js';

export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly userService: UserService
  ) {}

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const user = await this.userService.getById(request.user!.id);
    return reply.send({ user: toUserOutput(user) });
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const dto = parseBody(updateProfileValidator, request.body);
    const user = await this.commandBus.execute(new UpdateProfileCommand(request.user!.id, dto));
    return reply.send({ user: toUserOutput(user) });
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = await this.queryBus.execute(new GetUserQuery(id));
    return reply.send({ user: toUserOutput(user) });
  }
}
