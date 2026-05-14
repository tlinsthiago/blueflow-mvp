import { z } from 'zod';
import { requireRoles, writeRoles } from '../lib/authorization.js';
import { fail, getPagination, ok, paginationMeta, parseWithSchema } from '../lib/http.js';

const condominiumPayloadSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.'),
  legalName: z.string().trim().optional().nullable(),
  cnpj: z.string().trim().optional().nullable(),
  addressLine: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().max(2, 'UF deve ter no máximo 2 caracteres.').optional().nullable(),
  managerName: z.string().trim().optional().nullable(),
  managerCpf: z.string().trim().optional().nullable(),
  managerPhone: z.string().trim().optional().nullable(),
  managerEmail: z.string().trim().email('E-mail inválido.').optional().nullable().or(z.literal('')),
  units: z.coerce.number().int().min(0).optional(),
  monthlyWindow: z.string().trim().optional().nullable(),
  status: z.string().trim().optional(),
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
    legalName: payload.legalName || null,
    cnpj: payload.cnpj || null,
    addressLine: payload.addressLine || null,
    city: payload.city || null,
    state: payload.state || null,
    managerName: payload.managerName || null,
    managerCpf: payload.managerCpf || null,
    managerPhone: payload.managerPhone || null,
    managerEmail: payload.managerEmail || null,
    units: payload.units ?? 0,
    monthlyWindow: payload.monthlyWindow || null,
    status: payload.status || 'Ativo',
  };
}

function buildWhere(query) {
  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { legalName: { contains: query.search, mode: 'insensitive' } },
      { cnpj: { contains: query.search, mode: 'insensitive' } },
      { city: { contains: query.search, mode: 'insensitive' } },
      { managerName: { contains: query.search, mode: 'insensitive' } },
      { managerEmail: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  return where;
}

export async function condominiumRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (request, reply) => {
    const parsed = parseWithSchema(listQuerySchema, request.query);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const pagination = getPagination(parsed.data);
    const where = buildWhere(parsed.data);

    const [items, total] = await Promise.all([
      app.prisma.condominium.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      app.prisma.condominium.count({ where }),
    ]);

    return ok(items, paginationMeta({ page: pagination.page, pageSize: pagination.pageSize, total }));
  });

  app.get('/:id', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const condominium = await app.prisma.condominium.findUnique({
      where: { id: parsed.data.id },
    });

    if (!condominium) {
      return fail(reply, 404, 'Condomínio não encontrado.');
    }

    return ok(condominium);
  });

  app.post('/', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(condominiumPayloadSchema, request.body);
    if (parsed.error) {
      return fail(reply, 400, 'Dados inválidos.', parsed.error);
    }

    const condominium = await app.prisma.condominium.create({
      data: cleanPayload(parsed.data),
    });

    return reply.code(201).send(ok(condominium));
  });

  app.put('/:id', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const params = parseWithSchema(idParamsSchema, request.params);
    if (params.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', params.error);
    }

    const body = parseWithSchema(condominiumPayloadSchema, request.body);
    if (body.error) {
      return fail(reply, 400, 'Dados inválidos.', body.error);
    }

    const exists = await app.prisma.condominium.findUnique({
      where: { id: params.data.id },
      select: { id: true },
    });

    if (!exists) {
      return fail(reply, 404, 'Condomínio não encontrado.');
    }

    const condominium = await app.prisma.condominium.update({
      where: { id: params.data.id },
      data: cleanPayload(body.data),
    });

    return ok(condominium);
  });

  app.delete('/:id', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const condominium = await app.prisma.condominium.findUnique({
      where: { id: parsed.data.id },
      select: {
        id: true,
        _count: {
          select: {
            visits: true,
            contracts: true,
          },
        },
      },
    });

    if (!condominium) {
      return fail(reply, 404, 'Condomínio não encontrado.');
    }

    if (condominium._count.visits > 0 || condominium._count.contracts > 0) {
      return fail(reply, 409, 'Não foi possível excluir. Este condomínio possui vínculos com visitas ou contratos.');
    }

    await app.prisma.condominium.delete({
      where: { id: parsed.data.id },
    });

    return ok({ id: parsed.data.id });
  });
}
