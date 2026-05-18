import { z } from 'zod';
import { requireRoles, writeRoles } from '../lib/authorization.js';
import { fail, getPagination, ok, paginationMeta, parseWithSchema } from '../lib/http.js';

const optionalDate = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.coerce.date({ invalid_type_error: 'Data inválida.' }).nullable()
);

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.coerce.number().nullable()
);

const optionalInteger = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.coerce.number().int().nullable()
);

const contractPayloadSchema = z.object({
  condominiumId: z.string().uuid('Condomínio inválido.'),
  contractNumber: z.string().trim().min(1, 'Número do contrato é obrigatório.'),
  serviceType: z.string().trim().min(1, 'Tipo de serviço é obrigatório.'),
  monthlyValue: optionalNumber.refine((value) => value === null || value >= 0, 'Valor mensal não pode ser negativo.'),
  dueDay: optionalInteger.refine((value) => value === null || (value >= 1 && value <= 31), 'Dia de vencimento deve estar entre 1 e 31.'),
  termMonths: optionalInteger.refine((value) => value === null || value >= 0, 'Prazo não pode ser negativo.'),
  startDate: optionalDate,
  signatureDate: optionalDate,
  monthlyPreventiveVisits: optionalInteger.refine(
    (value) => value === null || value >= 0,
    'Visitas preventivas não pode ser negativo.'
  ),
  emergencySlaHours: optionalInteger.refine((value) => value === null || value >= 0, 'SLA emergencial não pode ser negativo.'),
  nonEmergencySlaHours: optionalInteger.refine((value) => value === null || value >= 0, 'SLA não emergencial não pode ser negativo.'),
  jurisdiction: z.string().trim().optional().nullable(),
  status: z.string().trim().optional(),
  notes: z.string().trim().optional().nullable(),
  signedFileId: z.string().uuid('Arquivo assinado inválido.').optional().nullable(),
});

const listQuerySchema = z.object({
  condominiumId: z.string().uuid('Condomínio inválido.').optional(),
  status: z.string().trim().optional(),
  serviceType: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const idParamsSchema = z.object({
  id: z.string().uuid('ID inválido.'),
});

const contractInclude = {
  condominium: true,
  signedFile: true,
};

function cleanPayload(payload) {
  return {
    condominiumId: payload.condominiumId,
    contractNumber: payload.contractNumber,
    serviceType: payload.serviceType,
    monthlyValue: payload.monthlyValue,
    dueDay: payload.dueDay,
    termMonths: payload.termMonths,
    startDate: payload.startDate,
    signatureDate: payload.signatureDate,
    monthlyPreventiveVisits: payload.monthlyPreventiveVisits,
    emergencySlaHours: payload.emergencySlaHours,
    nonEmergencySlaHours: payload.nonEmergencySlaHours,
    jurisdiction: payload.jurisdiction || null,
    status: payload.status || 'Rascunho',
    notes: payload.notes || null,
    signedFileId: payload.signedFileId || null,
  };
}

function buildWhere(query) {
  const where = {};

  if (query.condominiumId) {
    where.condominiumId = query.condominiumId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.serviceType) {
    where.serviceType = { contains: query.serviceType, mode: 'insensitive' };
  }

  return where;
}

async function validateRelations(app, payload, reply) {
  const condominium = await app.prisma.condominium.findUnique({
    where: { id: payload.condominiumId },
    select: { id: true },
  });

  if (!condominium) {
    return fail(reply, 400, 'Não foi possível salvar. Condomínio inexistente.');
  }

  if (payload.signedFileId) {
    const signedFile = await app.prisma.file.findUnique({
      where: { id: payload.signedFileId },
      select: { id: true },
    });

    if (!signedFile) {
      return fail(reply, 400, 'Não foi possível salvar. Arquivo assinado inexistente.');
    }
  }

  return null;
}

export async function contractRoutes(app) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRoles(writeRoles));

  app.get('/', async (request, reply) => {
    const parsed = parseWithSchema(listQuerySchema, request.query);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const pagination = getPagination(parsed.data);
    const where = buildWhere(parsed.data);

    const [items, total] = await Promise.all([
      app.prisma.contract.findMany({
        where,
        include: contractInclude,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      app.prisma.contract.count({ where }),
    ]);

    return ok(items, paginationMeta({ page: pagination.page, pageSize: pagination.pageSize, total }));
  });

  app.get('/:id', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const contract = await app.prisma.contract.findUnique({
      where: { id: parsed.data.id },
      include: contractInclude,
    });

    if (!contract) {
      return fail(reply, 404, 'Contrato não encontrado.');
    }

    return ok(contract);
  });

  app.post('/', async (request, reply) => {
    const parsed = parseWithSchema(contractPayloadSchema, request.body);
    if (parsed.error) {
      return fail(reply, 400, 'Dados inválidos.', parsed.error);
    }

    const relationError = await validateRelations(app, parsed.data, reply);
    if (relationError) {
      return relationError;
    }

    const contract = await app.prisma.contract.create({
      data: cleanPayload(parsed.data),
      include: contractInclude,
    });

    return reply.code(201).send(ok(contract));
  });

  app.put('/:id', async (request, reply) => {
    const params = parseWithSchema(idParamsSchema, request.params);
    if (params.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', params.error);
    }

    const body = parseWithSchema(contractPayloadSchema, request.body);
    if (body.error) {
      return fail(reply, 400, 'Dados inválidos.', body.error);
    }

    const exists = await app.prisma.contract.findUnique({
      where: { id: params.data.id },
      select: { id: true },
    });

    if (!exists) {
      return fail(reply, 404, 'Contrato não encontrado.');
    }

    const relationError = await validateRelations(app, body.data, reply);
    if (relationError) {
      return relationError;
    }

    const contract = await app.prisma.contract.update({
      where: { id: params.data.id },
      data: cleanPayload(body.data),
      include: contractInclude,
    });

    return ok(contract);
  });

  app.delete('/:id', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const exists = await app.prisma.contract.findUnique({
      where: { id: parsed.data.id },
      select: { id: true },
    });

    if (!exists) {
      return fail(reply, 404, 'Contrato não encontrado.');
    }

    await app.prisma.contract.delete({
      where: { id: parsed.data.id },
    });

    return ok({ id: parsed.data.id });
  });
}
