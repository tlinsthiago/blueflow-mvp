import { z } from 'zod';
import { requireRoles, writeRoles } from '../lib/authorization.js';
import { fail, getPagination, ok, paginationMeta, parseWithSchema } from '../lib/http.js';

const visitStatuses = ['scheduled', 'in_progress', 'completed', 'pending', 'cancelled'];
const checklistStatuses = ['normal', 'attention', 'critical'];
const createOrEditRoles = [...writeRoles, 'collaborator'];

const checklistItemSchema = z.object({
  equipment: z.string().trim().min(1, 'Equipamento é obrigatório.'),
  status: z.enum(checklistStatuses).default('normal'),
  notes: z.string().trim().optional().nullable(),
});

const visitPayloadSchema = z.object({
  condominiumId: z.string().uuid('Condomínio inválido.'),
  technicianId: z.string().uuid('Técnico inválido.'),
  serviceType: z.string().trim().min(1, 'Tipo de serviço é obrigatório.'),
  status: z.enum(visitStatuses).default('scheduled'),
  visitDate: z.coerce.date({ invalid_type_error: 'Data da visita inválida.' }),
  responsibleName: z.string().trim().optional().nullable(),
  responsibleRole: z.string().trim().optional().nullable(),
  acceptanceConfirmed: z.coerce.boolean().default(false),
  acceptanceResponsibleName: z.string().trim().optional().nullable(),
  acceptanceResponsibleRole: z.string().trim().optional().nullable(),
  installationLocation: z.string().trim().optional().nullable(),
  equipmentValue: z.coerce.number().min(0, 'Valor do equipamento não pode ser negativo.').optional().nullable(),
  acceptanceNotes: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  actionsPerformed: z.string().trim().optional().nullable(),
  issuesFound: z.string().trim().optional().nullable(),
  improvementsSuggested: z.string().trim().optional().nullable(),
  checklistItems: z.array(checklistItemSchema).optional(),
});

const listQuerySchema = z.object({
  condominiumId: z.string().uuid('Condomínio inválido.').optional(),
  technicianId: z.string().uuid('Técnico inválido.').optional(),
  status: z.enum(visitStatuses).optional(),
  serviceType: z.string().trim().optional(),
  startDate: z.coerce.date({ invalid_type_error: 'Data inicial inválida.' }).optional(),
  endDate: z.coerce.date({ invalid_type_error: 'Data final inválida.' }).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const idParamsSchema = z.object({
  id: z.string().uuid('ID inválido.'),
});

const visitInclude = {
  condominium: true,
  technician: true,
  checklistItems: {
    orderBy: { equipment: 'asc' },
  },
};

function cleanVisitPayload(payload) {
  return {
    condominiumId: payload.condominiumId,
    technicianId: payload.technicianId,
    serviceType: payload.serviceType,
    status: payload.status,
    visitDate: payload.visitDate,
    responsibleName: payload.responsibleName || null,
    responsibleRole: payload.responsibleRole || null,
    acceptanceConfirmed: payload.acceptanceConfirmed,
    acceptanceResponsibleName: payload.acceptanceResponsibleName || payload.responsibleName || null,
    acceptanceResponsibleRole: payload.acceptanceResponsibleRole || payload.responsibleRole || null,
    installationLocation: payload.installationLocation || null,
    equipmentValue: payload.equipmentValue ?? null,
    acceptanceNotes: payload.acceptanceNotes || null,
    notes: payload.notes || null,
    actionsPerformed: payload.actionsPerformed || null,
    issuesFound: payload.issuesFound || null,
    improvementsSuggested: payload.improvementsSuggested || null,
  };
}

function cleanChecklistItems(items = []) {
  return items.map((item) => ({
    equipment: item.equipment,
    status: item.status,
    notes: item.notes || null,
  }));
}

function buildWhere(query) {
  const where = {};

  if (query.condominiumId) {
    where.condominiumId = query.condominiumId;
  }

  if (query.technicianId) {
    where.technicianId = query.technicianId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.serviceType) {
    where.serviceType = { contains: query.serviceType, mode: 'insensitive' };
  }

  if (query.startDate || query.endDate) {
    where.visitDate = {};
    if (query.startDate) {
      where.visitDate.gte = query.startDate;
    }
    if (query.endDate) {
      where.visitDate.lte = query.endDate;
    }
  }

  return where;
}

async function validateRelations(app, payload, reply) {
  const [condominium, technician] = await Promise.all([
    app.prisma.condominium.findUnique({
      where: { id: payload.condominiumId },
      select: { id: true },
    }),
    app.prisma.technician.findUnique({
      where: { id: payload.technicianId },
      select: { id: true },
    }),
  ]);

  if (!condominium) {
    return fail(reply, 400, 'Não foi possível salvar. Condomínio inexistente.');
  }

  if (!technician) {
    return fail(reply, 400, 'Não foi possível salvar. Técnico inexistente.');
  }

  return null;
}

export async function visitRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (request, reply) => {
    const parsed = parseWithSchema(listQuerySchema, request.query);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const pagination = getPagination(parsed.data);
    const where = buildWhere(parsed.data);

    const [items, total] = await Promise.all([
      app.prisma.visit.findMany({
        where,
        include: visitInclude,
        orderBy: { visitDate: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      app.prisma.visit.count({ where }),
    ]);

    return ok(items, paginationMeta({ page: pagination.page, pageSize: pagination.pageSize, total }));
  });

  app.get('/:id', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const visit = await app.prisma.visit.findUnique({
      where: { id: parsed.data.id },
      include: visitInclude,
    });

    if (!visit) {
      return fail(reply, 404, 'Visita não encontrada.');
    }

    return ok(visit);
  });

  app.post('/', { preHandler: [requireRoles(createOrEditRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(visitPayloadSchema, request.body);
    if (parsed.error) {
      return fail(reply, 400, 'Dados inválidos.', parsed.error);
    }

    const relationError = await validateRelations(app, parsed.data, reply);
    if (relationError) {
      return relationError;
    }

    const visit = await app.prisma.visit.create({
      data: {
        ...cleanVisitPayload(parsed.data),
        checklistItems: {
          create: cleanChecklistItems(parsed.data.checklistItems),
        },
      },
      include: visitInclude,
    });

    return reply.code(201).send(ok(visit));
  });

  app.put('/:id', { preHandler: [requireRoles(createOrEditRoles)] }, async (request, reply) => {
    const params = parseWithSchema(idParamsSchema, request.params);
    if (params.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', params.error);
    }

    const body = parseWithSchema(visitPayloadSchema, request.body);
    if (body.error) {
      return fail(reply, 400, 'Dados inválidos.', body.error);
    }

    const exists = await app.prisma.visit.findUnique({
      where: { id: params.data.id },
      select: { id: true },
    });

    if (!exists) {
      return fail(reply, 404, 'Visita não encontrada.');
    }

    const relationError = await validateRelations(app, body.data, reply);
    if (relationError) {
      return relationError;
    }

    const visit = await app.prisma.$transaction(async (tx) => {
      await tx.visitChecklistItem.deleteMany({
        where: { visitId: params.data.id },
      });

      return tx.visit.update({
        where: { id: params.data.id },
        data: {
          ...cleanVisitPayload(body.data),
          checklistItems: {
            create: cleanChecklistItems(body.data.checklistItems),
          },
        },
        include: visitInclude,
      });
    });

    return ok(visit);
  });

  app.delete('/:id', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const exists = await app.prisma.visit.findUnique({
      where: { id: parsed.data.id },
      select: { id: true },
    });

    if (!exists) {
      return fail(reply, 404, 'Visita não encontrada.');
    }

    await app.prisma.visit.delete({
      where: { id: parsed.data.id },
    });

    return ok({ id: parsed.data.id });
  });
}
