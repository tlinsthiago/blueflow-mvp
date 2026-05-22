import { del, get, put } from '@vercel/blob';
import { Readable } from 'node:stream';
import { z } from 'zod';
import { requireRoles, writeRoles } from '../lib/authorization.js';
import { fail, getPagination, ok, paginationMeta, parseWithSchema } from '../lib/http.js';
import { withPrismaRetry } from '../lib/prisma.js';

const visitStatuses = ['scheduled', 'in_progress', 'completed', 'pending', 'cancelled'];
const checklistStatuses = ['normal', 'attention', 'critical'];
const fileTypes = ['reservoir_photo', 'pump_photo', 'electrical_panel_photo', 'signed_acceptance_term', 'other'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];
const maxUploadSizeBytes = 10 * 1024 * 1024;
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

const fileParamsSchema = z.object({
  id: z.string().uuid('ID da visita invÃ¡lido.'),
  fileId: z.string().uuid('ID do arquivo invÃ¡lido.'),
});

const fileTypeSchema = z.enum(fileTypes);

const visitInclude = {
  condominium: true,
  technician: true,
  checklistItems: {
    orderBy: { equipment: 'asc' },
  },
  files: {
    orderBy: { uploadedAt: 'desc' },
  },
  report: {
    include: { file: true },
  },
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

async function getVisitOrFail(app, visitId, reply, request = null) {
  const baseLog = request
    ? {
        visitId,
        userId: request.currentUser?.id,
        userRole: request.currentUser?.role,
        hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      }
    : null;

  if (request) {
    logUploadStep(request, 'visit_validation_started', baseLog);
  }

  let visit = null;
  try {
    visit = await withPrismaRetry(
      () =>
        app.prisma.visit.findUnique({
          where: { id: visitId },
          select: { id: true },
        }),
      {
        retries: 1,
        onRetry: (error, attempt) => {
          if (request) {
            logUploadError(request, 'visit_validation_retry', error, { ...baseLog, attempt });
          }
        },
      }
    );
  } catch (error) {
    if (request) {
      logUploadError(request, 'visit_validation_failed', error, baseLog);
    }
    return fail(reply, 500, 'Falha ao consultar visita no banco.');
  }

  if (!visit) {
    return fail(reply, 404, 'Visita nÃ£o encontrada.');
  }

  if (request) {
    logUploadStep(request, 'visit_validation_finished', baseLog);
  }

  return visit;
}

function getUploadFailureMessage(error) {
  if (error.code === 'P2021' || error.code === 'P2022') {
    return 'Banco de dados nÃ£o estÃ¡ atualizado para uploads. Rode a migration de arquivos de Visitas em produÃ§Ã£o.';
  }

  if (error.message?.includes('Unknown argument')) {
    return 'Backend nÃ£o foi atualizado completamente para uploads. Gere o Prisma Client e faÃ§a novo deploy.';
  }

  if (error.message?.toLowerCase().includes('blob') || error.message?.toLowerCase().includes('token')) {
    return 'Vercel Blob recusou o upload. Verifique BLOB_READ_WRITE_TOKEN no ambiente do backend.';
  }

  return 'NÃ£o foi possÃ­vel enviar o arquivo. Verifique a configuraÃ§Ã£o do Blob e as migrations do banco.';
}

function serializeError(error) {
  return {
    name: error?.name,
    code: error?.code,
    message: error?.message,
    stack: error?.stack,
    cause: error?.cause
      ? {
          name: error.cause.name,
          code: error.cause.code,
          message: error.cause.message,
          stack: error.cause.stack,
        }
      : undefined,
  };
}

function logUploadStep(request, step, details = {}) {
  console.log('[visit_file_upload]', {
    step,
    visitId: details.visitId,
    fileType: details.fileType,
    hasBlobToken: details.hasBlobToken,
  });

  request.log.info(
    {
      event: 'visit_file_upload',
      step,
      ...details,
    },
    `visit file upload: ${step}`
  );
}

function logUploadError(request, step, error, details = {}) {
  console.error('[visit_file_upload]', {
    step,
    visitId: details.visitId,
    fileType: details.fileType,
    hasBlobToken: details.hasBlobToken,
    errorName: error?.name,
    errorMessage: error?.message,
    errorStack: error?.stack,
  });

  request.log.error(
    {
      event: 'visit_file_upload',
      step,
      error: serializeError(error),
      ...details,
    },
    `visit file upload failed: ${step}`
  );
}

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

  app.get('/:id/files', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'ParÃ¢metros invÃ¡lidos.', parsed.error);
    }

    const visitId = parsed.data.id;
    const baseLog = {
      visitId,
      userId: request.currentUser?.id,
      userRole: request.currentUser?.role,
      hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    };

    logUploadStep(request, 'request_started', baseLog);

    const visit = await getVisitOrFail(app, visitId, reply, request);
    if (!visit.id) {
      return visit;
    }

    const files = await app.prisma.file.findMany({
      where: { visitId: parsed.data.id },
      orderBy: { uploadedAt: 'desc' },
    });

    return ok(files);
  });

  app.post('/:id/files', { preHandler: [requireRoles(createOrEditRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'ParÃ¢metros invÃ¡lidos.', parsed.error);
    }

    const visitId = parsed.data.id;
    const baseLog = {
      visitId,
      userId: request.currentUser?.id,
      userRole: request.currentUser?.role,
      hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    };

    logUploadStep(request, 'request_started', baseLog);

    const visit = await getVisitOrFail(app, visitId, reply, request);
    if (!visit.id) {
      return visit;
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      logUploadStep(request, 'blob_token_missing', baseLog);
      return fail(reply, 500, 'Upload nÃ£o configurado. Defina BLOB_READ_WRITE_TOKEN no backend.');
    }

    let selectedFile = null;
    let selectedFileType = null;

    try {
      logUploadStep(request, 'multipart_read_started', baseLog);
      const parts = request.parts({
        limits: {
          fileSize: maxUploadSizeBytes,
          files: 1,
        },
      });

      for await (const part of parts) {
        if (part.type === 'file') {
          if (part.fieldname !== 'file') {
            part.file.resume();
            continue;
          }

          const buffer = await streamToBuffer(part.file);
          selectedFile = {
            buffer,
            fileName: part.filename,
            mimeType: part.mimetype,
            truncated: part.file.truncated,
          };
          continue;
        }

        if (part.fieldname === 'fileType') {
          selectedFileType = part.value;
          logUploadStep(request, 'file_type_received', { ...baseLog, fileType: selectedFileType });
        }
      }
    } catch (error) {
      if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
        logUploadError(request, 'multipart_file_too_large', error, baseLog);
        return fail(reply, 413, 'Arquivo excede o tamanho mÃ¡ximo permitido de 10 MB.');
      }

      logUploadError(request, 'multipart_read_failed', error, baseLog);
      throw error;
    }

    if (!selectedFile) {
      logUploadStep(request, 'file_missing', { ...baseLog, fileType: selectedFileType });
      return fail(reply, 400, 'Envie um arquivo no campo file.');
    }

    if (selectedFile.truncated || selectedFile.buffer.length > maxUploadSizeBytes) {
      logUploadStep(request, 'file_too_large', {
        ...baseLog,
        fileType: selectedFileType,
        fileName: selectedFile.fileName,
        mimeType: selectedFile.mimeType,
        size: selectedFile.buffer.length,
      });
      return fail(reply, 413, 'Arquivo excede o tamanho mÃ¡ximo permitido de 10 MB.');
    }

    const typeValidation = fileTypeSchema.safeParse(selectedFileType ?? 'other');
    if (!typeValidation.success) {
      logUploadStep(request, 'file_type_invalid', { ...baseLog, fileType: selectedFileType });
      return fail(reply, 400, 'Tipo de arquivo invÃ¡lido.');
    }

    if (!allowedMimeTypes.includes(selectedFile.mimeType)) {
      logUploadStep(request, 'mime_type_invalid', {
        ...baseLog,
        fileType: typeValidation.data,
        fileName: selectedFile.fileName,
        mimeType: selectedFile.mimeType,
        size: selectedFile.buffer.length,
      });
      return fail(reply, 400, 'Tipo de arquivo nÃ£o permitido. Envie imagens ou PDF.');
    }

    logUploadStep(request, 'file_validation_finished', {
      ...baseLog,
      fileType: typeValidation.data,
      fileName: selectedFile.fileName,
      mimeType: selectedFile.mimeType,
      size: selectedFile.buffer.length,
    });

    const safeFileName = sanitizeFileName(selectedFile.fileName || 'arquivo');
    const storagePath = `visits/${parsed.data.id}/${typeValidation.data}/${Date.now()}-${safeFileName}`;
    let blob = null;

    try {
      logUploadStep(request, 'blob_upload_started', {
        ...baseLog,
        fileType: typeValidation.data,
        fileName: selectedFile.fileName,
        mimeType: selectedFile.mimeType,
        size: selectedFile.buffer.length,
      });

      blob = await put(storagePath, selectedFile.buffer, {
        access: 'private',
        contentType: selectedFile.mimeType,
        addRandomSuffix: true,
      });

      logUploadStep(request, 'blob_upload_finished', {
        ...baseLog,
        fileType: typeValidation.data,
        blobPathname: blob.pathname,
        blobUrl: blob.url,
      });

      logUploadStep(request, 'metadata_persist_started', {
        ...baseLog,
        fileType: typeValidation.data,
      });

      const file = await withPrismaRetry(
        () =>
          app.prisma.file.create({
            data: {
              visitId,
              fileName: selectedFile.fileName || safeFileName,
              fileType: typeValidation.data,
              mimeType: selectedFile.mimeType,
              storageKey: blob.pathname ?? storagePath,
              url: blob.url,
              size: selectedFile.buffer.length,
              uploadedBy: request.currentUser.id,
              publicUrl: blob.url,
              sizeBytes: selectedFile.buffer.length,
              category: typeValidation.data,
            },
          }),
        {
          retries: 1,
          onRetry: (error, attempt) => {
            logUploadError(request, 'metadata_persist_retry', error, { ...baseLog, attempt, fileType: typeValidation.data });
          },
        }
      );

      logUploadStep(request, 'metadata_persist_finished', {
        ...baseLog,
        fileType: typeValidation.data,
        fileId: file.id,
      });

      return reply.code(201).send(ok(file));
    } catch (error) {
      const failedAfterBlobUpload = Boolean(blob?.url);
      logUploadError(request, failedAfterBlobUpload ? 'metadata_or_blob_flow_failed' : 'blob_upload_failed', error, {
        ...baseLog,
        fileType: typeValidation.data,
        blobUploaded: failedAfterBlobUpload,
      });

      if (blob?.url) {
        await del(blob.url).catch((cleanupError) => request.log.error(cleanupError));
        return fail(reply, 500, 'Arquivo enviado, mas falhou ao salvar metadados.');
      }

      return fail(reply, 500, 'Falha ao enviar arquivo para Vercel Blob.');
    }
  });

  app.get('/:id/files/:fileId/download', async (request, reply) => {
    const parsed = parseWithSchema(fileParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'ParÃƒÂ¢metros invÃƒÂ¡lidos.', parsed.error);
    }

    const baseLog = {
      visitId: parsed.data.id,
      fileId: parsed.data.fileId,
      userId: request.currentUser?.id,
      userRole: request.currentUser?.role,
      hasBlobToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    };

    logUploadStep(request, 'download_request_started', baseLog);

    const visit = await getVisitOrFail(app, parsed.data.id, reply);
    if (!visit.id) {
      return visit;
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      logUploadStep(request, 'download_blob_token_missing', baseLog);
      return fail(reply, 500, 'Download nÃƒÂ£o configurado. Defina BLOB_READ_WRITE_TOKEN no backend.');
    }

    const file = await app.prisma.file.findFirst({
      where: {
        id: parsed.data.fileId,
        visitId: parsed.data.id,
      },
    });

    if (!file) {
      return fail(reply, 404, 'Arquivo nÃƒÂ£o encontrado.');
    }

    try {
      logUploadStep(request, 'private_blob_download_started', {
        ...baseLog,
        fileType: file.fileType,
      });

      const blob = await get(file.storageKey, {
        access: 'private',
        useCache: false,
      });

      if (!blob || blob.statusCode !== 200 || !blob.stream) {
        return fail(reply, 404, 'Arquivo nÃƒÂ£o encontrado no storage.');
      }

      logUploadStep(request, 'private_blob_download_finished', {
        ...baseLog,
        fileType: file.fileType,
      });

      reply.header('Content-Type', file.mimeType);
      reply.header('Content-Length', String(file.size ?? file.sizeBytes ?? blob.blob.size));
      reply.header('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName)}"`);
      reply.header('Cache-Control', 'private, max-age=60');

      return reply.send(Readable.fromWeb(blob.stream));
    } catch (error) {
      logUploadError(request, 'private_blob_download_failed', error, {
        ...baseLog,
        fileType: file.fileType,
      });

      return fail(reply, 500, 'Falha ao baixar arquivo privado.');
    }
  });

  app.delete('/:id/files/:fileId', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(fileParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'ParÃ¢metros invÃ¡lidos.', parsed.error);
    }

    const visit = await getVisitOrFail(app, parsed.data.id, reply);
    if (!visit.id) {
      return visit;
    }

    const file = await app.prisma.file.findFirst({
      where: {
        id: parsed.data.fileId,
        visitId: parsed.data.id,
      },
    });

    if (!file) {
      return fail(reply, 404, 'Arquivo nÃ£o encontrado.');
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return fail(reply, 500, 'Upload nÃ£o configurado. Defina BLOB_READ_WRITE_TOKEN no backend.');
    }

    await del(file.url ?? file.publicUrl ?? file.storageKey);
    await app.prisma.file.delete({
      where: { id: file.id },
    });

    return ok({ id: file.id });
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
