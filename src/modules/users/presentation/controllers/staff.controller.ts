import type { FastifyReply, FastifyRequest } from 'fastify';
import type { StaffService } from '../../application/services/staff.service.js';

export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const staff = await this.staffService.listStaff();
    return reply.send({ staff: staff.map(toStaffOutput) });
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const member = await this.staffService.getById(id);
    if (!member) {
      return reply.status(404).send({ message: 'Staff member not found.' });
    }
    return reply.send({ staff: toStaffOutput(member) });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: 'ADMIN';
      roleTemplate?: string;
      permissions?: string[];
    };

    if (!body.name || !body.email || !body.password || !body.role) {
      return reply.status(400).send({
        message: 'name, email, password and role are required.'
      });
    }

    try {
      const staff = await this.staffService.createStaff({
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        roleTemplate: body.roleTemplate,
        permissions: body.permissions
      });
      return reply.status(201).send({ staff: toStaffOutput(staff) });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as {
      name?: string;
      phone?: string;
      role?: 'ADMIN';
      status?: 'ACTIVE' | 'SUSPENDED';
      roleTemplate?: string;
      permissions?: string[];
      password?: string;
    };

    try {
      const staff = await this.staffService.updateStaff(id, body);
      return reply.send({ staff: toStaffOutput(staff) });
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const member = await this.staffService.getById(id);
    if (!member) {
      return reply.status(404).send({ message: 'Staff member not found.' });
    }
    if (member.role === 'SUPER_ADMIN') {
      return reply.status(400).send({ message: 'Super admins cannot be deleted.' });
    }
    await this.staffService.deleteStaff(id);
    return reply.send({ message: 'Staff member removed.' });
  }

  async roleCatalog(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      templates: this.staffService.getRoleTemplates(),
      permissions: this.staffService.getPermissionCatalog()
    });
  }
}

export function toStaffOutput(staff: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  permissions: unknown;
  createdAt: Date;
  lastLoginAt: Date | null;
}) {
  return {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    role: staff.role,
    status: staff.status,
    permissions: Array.isArray(staff.permissions) ? staff.permissions : [],
    createdAt: staff.createdAt,
    lastLoginAt: staff.lastLoginAt
  };
}
