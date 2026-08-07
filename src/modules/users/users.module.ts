import type { FastifyInstance } from 'fastify';
import type { Container } from '../../app/container.js';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository.js';
import { UserService } from './application/services/user.service.js';
import { UserController } from './presentation/controllers/user.controller.js';
import { AdminUserController } from './presentation/controllers/admin-user.controller.js';
import { StaffController } from './presentation/controllers/staff.controller.js';
import { StaffService } from './application/services/staff.service.js';
import { registerUserRoutes, registerAdminUserRoutes, registerStaffRoutes } from './presentation/routes/user.route.js';
import { CommandBus } from '../../core/application/commands/command-bus.js';
import { QueryBus } from '../../core/application/queries/query-bus.js';
import { UpdateProfileHandler } from './application/commands/update-profile/update-profile.handler.js';
import { DeactivateAccountHandler } from './application/commands/deactivate-account/deactivate-account.handler.js';
import { DeleteAccountHandler } from './application/commands/delete-account/delete-account.handler.js';
import { GetUserHandler } from './application/queries/get-user/get-user.handler.js';
import { GetCustomersHandler } from './application/queries/get-customers/get-customers.handler.js';
import { AdminUpdateUserHandler } from './application/commands/admin-update-user/admin-update-user.handler.js';

export function registerUsersModule(container: Container, app: FastifyInstance): void {
  container.register('user.repository', (c) => new PrismaUserRepository(c.get('prisma')));
  container.register('user.service', (c) =>
    new UserService(c.get('user.repository'), c.get('mailer.service'))
  );
  container.register('user.controller', (c) =>
    new UserController(c.get('command.bus'), c.get('query.bus'), c.get('user.service'))
  );
  container.register('admin-user.controller', (c) =>
    new AdminUserController(c.get('command.bus'), c.get('query.bus'))
  );
  container.register('staff.service', (c) =>
    new StaffService(c.get('user.repository'), c.get('password-hasher.service'), c.get('mailer.service'))
  );
  container.register('staff.controller', (c) => new StaffController(c.get('staff.service')));

  const commandBus = container.get<CommandBus>('command.bus');
  const queryBus = container.get<QueryBus>('query.bus');
  const userService = container.get<UserService>('user.service');

  commandBus
    .register(new UpdateProfileHandler(userService))
    .register(new DeactivateAccountHandler(userService))
    .register(new DeleteAccountHandler(userService))
    .register(new AdminUpdateUserHandler(userService));

  queryBus.register(new GetUserHandler(userService)).register(new GetCustomersHandler(userService));

  registerUserRoutes(app, container);
  registerAdminUserRoutes(app, container);
  registerStaffRoutes(app, container);
}
