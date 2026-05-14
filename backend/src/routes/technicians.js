import { z } from 'zod';
import { requireRoles, writeRoles } from '../lib/authorization.js';
import { fail, getPagination, ok, paginationMeta, parseWithSchema } from '../lib/http.js';

const technicianPayloadSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.'),
  phone: z.string().trim().optional().nullable(),
  role: z.string().trim().optional().nullable(),
  status: z.string().trim().optional(),
  notes: z.string().trim().optional().nullable(),
});

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const idParamsSchema = z.object({
  id: z.string().uuid('ID inválido.'),
});

function cleanPayload(payload) {
  return {
    name: payload.name,
    phone: payload.phone || null,
    role: payload.role || null,
    status: payload.status || 'Ativo',
    notes: payload.notes || null,
  };
}

function buildWhere(query) {
  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { phone: { contains: query.search, mode: 'insensitive' } },
      { role: { contains: query.search, mode: 'insensitive' } },
      { notes: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  return where;
}

export async function technicianRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (request, reply) => {
    const parsed = parseWithSchema(listQuerySchema, request.query);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const pagination = getPagination(parsed.data);
    const where = buildWhere(parsed.data);

    const [items, total] = await Promise.all([
      app.prisma.technician.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      app.prisma.technician.count({ where }),
    ]);

    return ok(items, paginationMeta({ page: pagination.page, pageSize: pagination.pageSize, total }));
  });

  app.get('/:id', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const technician = await app.prisma.technician.findUnique({
      where: { id: parsed.data.id },
    });

    if (!technician) {
      return fail(reply, 404, 'Técnico não encontrado.');
    }

    return ok(technician);
  });

  app.post('/', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(technicianPayloadSchema, request.body);
    if (parsed.error) {
      return fail(reply, 400, 'Dados inválidos.', parsed.error);
    }

    const technician = await app.prisma.technician.create({
      data: cleanPayload(parsed.data),
    });

    return reply.code(201).send(ok(technician));
  });

  app.put('/:id', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const params = parseWithSchema(idParamsSchema, request.params);
    if (params.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', params.error);
    }

    const body = parseWithSchema(technicianPayloadSchema, request.body);
    if (body.error) {
      return fail(reply, 400, 'Dados inválidos.', body.error);
    }

    const exists = await app.prisma.technician.findUnique({
      where: { id: params.data.id },
      select: { id: true },
    });

    if (!exists) {
      return fail(reply, 404, 'Técnico não encontrado.');
    }

    const technician = await app.prisma.technician.update({
      where: { id: params.data.id },
      data: cleanPayload(body.data),
    });

    return ok(technician);
  });

  app.delete('/:id', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const technician = await app.prisma.technician.findUnique({
      where: { id: parsed.data.id },
      select: {
        id: true,
        _count: {
          select: {
            visits: true,
          },
        },
      },
    });

    if (!technician) {
      return fail(reply, 404, 'Técnico não encontrado.');
    }

    if (technician._count.visits > 0) {
      return fail(reply, 409, 'Não foi possível excluir. Este técnico possui visitas técnicas vinculadas.');
    }

    await app.prisma.technician.delete({
      where: { id: parsed.data.id },
    });

    return ok({ id: parsed.data.id });
  });
}
