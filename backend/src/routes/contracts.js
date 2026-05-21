import { del, get, put } from '@vercel/blob';
import { Readable } from 'node:stream';
import { z } from 'zod';
import { requireRoles, writeRoles } from '../lib/authorization.js';
import { fail, getPagination, ok, paginationMeta, parseWithSchema } from '../lib/http.js';
import { withPrismaRetry } from '../lib/prisma.js';

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

const signedContractFileType = 'signed_contract';
const allowedSignedContractMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const maxSignedContractSizeBytes = 10 * 1024 * 1024;

const contractInclude = {
  condominium: true,
  signedFile: true,
};

function sanitizeFileName(fileName) {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

async function streamToBuffer(stream) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

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

async function getContractOrFail(app, contractId, reply, includeSignedFile = false) {
  const contract = await app.prisma.contract.findUnique({
    where: { id: contractId },
    include: includeSignedFile ? { signedFile: true } : undefined,
  });

  if (!contract) {
    return fail(reply, 404, 'Contrato não encontrado.');
  }

  return contract;
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

  app.post('/:id/signed-file', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return fail(reply, 500, 'Upload não configurado. Defina BLOB_READ_WRITE_TOKEN no backend.');
    }

    const contract = await getContractOrFail(app, parsed.data.id, reply, true);
    if (!contract.id) {
      return contract;
    }

    let selectedFile = null;

    try {
      const parts = request.parts({
        limits: {
          fileSize: maxSignedContractSizeBytes,
          files: 1,
        },
      });

      for await (const part of parts) {
        if (part.type !== 'file' || part.fieldname !== 'file') {
          if (part.type === 'file') {
            part.file.resume();
          }
          continue;
        }

        const buffer = await streamToBuffer(part.file);
        selectedFile = {
          buffer,
          fileName: part.filename,
          mimeType: part.mimetype,
          truncated: part.file.truncated,
        };
      }
    } catch (error) {
      if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
        return fail(reply, 413, 'Arquivo excede o tamanho máximo permitido de 10 MB.');
      }

      throw error;
    }

    if (!selectedFile) {
      return fail(reply, 400, 'Envie um arquivo no campo file.');
    }

    if (selectedFile.truncated || selectedFile.buffer.length > maxSignedContractSizeBytes) {
      return fail(reply, 413, 'Arquivo excede o tamanho máximo permitido de 10 MB.');
    }

    if (!allowedSignedContractMimeTypes.includes(selectedFile.mimeType)) {
      return fail(reply, 400, 'Tipo de arquivo não permitido. Envie PDF ou imagem.');
    }

    const safeFileName = sanitizeFileName(selectedFile.fileName || 'contrato-assinado');
    const storagePath = `contracts/${parsed.data.id}/signed-file/${Date.now()}-${safeFileName}`;
    let blob = null;

    try {
      blob = await put(storagePath, selectedFile.buffer, {
        access: 'private',
        contentType: selectedFile.mimeType,
        addRandomSuffix: true,
      });

      const { contract: updatedContract, oldFile } = await withPrismaRetry(
        () =>
          app.prisma.$transaction(async (tx) => {
            const file = await tx.file.create({
              data: {
                fileName: selectedFile.fileName || safeFileName,
                fileType: signedContractFileType,
                mimeType: selectedFile.mimeType,
                storageKey: blob.pathname ?? storagePath,
                url: blob.url,
                size: selectedFile.buffer.length,
                uploadedBy: request.currentUser.id,
                publicUrl: blob.url,
                sizeBytes: selectedFile.buffer.length,
                category: signedContractFileType,
              },
            });

            const nextContract = await tx.contract.update({
              where: { id: parsed.data.id },
              data: { signedFileId: file.id },
              include: contractInclude,
            });

            return {
              contract: nextContract,
              oldFile: contract.signedFile,
            };
          }),
        { retries: 1 }
      );

      if (oldFile) {
        await del(oldFile.url ?? oldFile.publicUrl ?? oldFile.storageKey).catch((cleanupError) =>
          request.log.error(cleanupError, 'failed to remove previous signed contract blob')
        );
        await app.prisma.file.delete({ where: { id: oldFile.id } }).catch((cleanupError) =>
          request.log.error(cleanupError, 'failed to remove previous signed contract metadata')
        );
      }

      return reply.code(201).send(ok(updatedContract));
    } catch {
      if (blob?.url) {
        await del(blob.url).catch((cleanupError) => request.log.error(cleanupError));
        return fail(reply, 500, 'Arquivo enviado, mas falhou ao salvar metadados.');
      }

      return fail(reply, 500, 'Falha ao enviar arquivo para Vercel Blob.');
    }
  });

  app.get('/:id/signed-file/download', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return fail(reply, 500, 'Download não configurado. Defina BLOB_READ_WRITE_TOKEN no backend.');
    }

    const contract = await getContractOrFail(app, parsed.data.id, reply, true);
    if (!contract.id) {
      return contract;
    }

    if (!contract.signedFile) {
      return fail(reply, 404, 'Contrato assinado não encontrado.');
    }

    try {
      const blob = await get(contract.signedFile.storageKey, {
        access: 'private',
        useCache: false,
      });

      if (!blob || blob.statusCode !== 200 || !blob.stream) {
        return fail(reply, 404, 'Arquivo não encontrado no storage.');
      }

      reply.header('Content-Type', contract.signedFile.mimeType);
      reply.header('Content-Length', String(contract.signedFile.size ?? contract.signedFile.sizeBytes ?? blob.blob.size));
      reply.header('Content-Disposition', `inline; filename="${encodeURIComponent(contract.signedFile.fileName)}"`);
      reply.header('Cache-Control', 'private, max-age=60');

      return reply.send(Readable.fromWeb(blob.stream));
    } catch {
      return fail(reply, 500, 'Falha ao baixar contrato assinado.');
    }
  });

  app.delete('/:id/signed-file', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return fail(reply, 500, 'Upload não configurado. Defina BLOB_READ_WRITE_TOKEN no backend.');
    }

    const contract = await getContractOrFail(app, parsed.data.id, reply, true);
    if (!contract.id) {
      return contract;
    }

    if (!contract.signedFile) {
      return fail(reply, 404, 'Contrato assinado não encontrado.');
    }

    await del(contract.signedFile.url ?? contract.signedFile.publicUrl ?? contract.signedFile.storageKey).catch((error) =>
      request.log.error(error, 'failed to delete signed contract blob')
    );

    const updatedContract = await app.prisma.$transaction(async (tx) => {
      const nextContract = await tx.contract.update({
        where: { id: parsed.data.id },
        data: { signedFileId: null },
        include: contractInclude,
      });

      await tx.file.delete({
        where: { id: contract.signedFile.id },
      });

      return nextContract;
    });

    return ok(updatedContract);
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
