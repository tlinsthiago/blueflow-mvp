import { del, get, put } from '@vercel/blob';
import { Readable } from 'node:stream';
import { z } from 'zod';
import { requireRoles, writeRoles } from '../lib/authorization.js';
import { fail, getPagination, ok, paginationMeta, parseWithSchema } from '../lib/http.js';
import { generateTechnicalReportPdf } from '../lib/reportPdf.js';
import { withPrismaRetry } from '../lib/prisma.js';

const reportAccessRoles = ['admin', 'manager', 'collaborator'];
const maxEmbeddedImages = 8;

const idParamsSchema = z.object({
  id: z.string().uuid('ID inválido.'),
});

const listQuerySchema = z.object({
  condominiumId: z.string().uuid('Condomínio inválido.').optional(),
  technicianId: z.string().uuid('Técnico inválido.').optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const reportInclude = {
  file: true,
  visit: {
    include: {
      condominium: true,
      technician: true,
      checklistItems: {
        orderBy: { equipment: 'asc' },
      },
      files: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
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

function reportFileName(visit) {
  const condominiumName = sanitizeFileName(visit.condominium?.name ?? 'condominio');
  const date = new Date().toISOString().slice(0, 10);
  return `relatorio-tecnico-${condominiumName}-${date}.pdf`;
}

async function webStreamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of Readable.fromWeb(stream)) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

async function loadImageAttachments(visit, request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return [];
  }

  const imageFiles = (visit.files ?? [])
    .filter((file) => file.mimeType?.startsWith('image/'))
    .filter((file) => ['image/jpeg', 'image/png'].includes(file.mimeType))
    .slice(0, maxEmbeddedImages);

  const attachments = [];
  for (const file of imageFiles) {
    try {
      const blob = await get(file.storageKey, {
        access: 'private',
        useCache: false,
      });

      if (blob?.statusCode === 200 && blob.stream) {
        attachments.push({
          fileName: file.fileName,
          fileType: file.fileType,
          mimeType: file.mimeType,
          buffer: await webStreamToBuffer(blob.stream),
        });
      }
    } catch (error) {
      request.log.warn(
        {
          event: 'report_image_attachment_failed',
          fileId: file.id,
          error: {
            name: error?.name,
            message: error?.message,
          },
        },
        'failed to embed report image attachment'
      );
    }
  }

  return attachments;
}

function buildReportWhere(query) {
  const where = {};

  if (query.condominiumId || query.technicianId) {
    where.visit = {};
    if (query.condominiumId) {
      where.visit.condominiumId = query.condominiumId;
    }
    if (query.technicianId) {
      where.visit.technicianId = query.technicianId;
    }
  }

  return where;
}

async function getReportOrFail(app, reportId, reply) {
  const report = await app.prisma.report.findUnique({
    where: { id: reportId },
    include: reportInclude,
  });

  if (!report) {
    return fail(reply, 404, 'Relatório não encontrado.');
  }

  return report;
}

export async function reportRoutes(app) {
  app.addHook('preHandler', app.authenticate);

  app.get('/reports', async (request, reply) => {
    const parsed = parseWithSchema(listQuerySchema, request.query);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const pagination = getPagination(parsed.data);
    const where = buildReportWhere(parsed.data);
    const [items, total] = await Promise.all([
      app.prisma.report.findMany({
        where,
        include: reportInclude,
        orderBy: { generatedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      app.prisma.report.count({ where }),
    ]);

    return ok(items, paginationMeta({ page: pagination.page, pageSize: pagination.pageSize, total }));
  });

  app.get('/reports/:id', async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const report = await getReportOrFail(app, parsed.data.id, reply);
    if (!report.id) {
      return report;
    }

    return ok(report);
  });

  app.post('/visits/:id/generate-report', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return fail(reply, 500, 'Geração de relatório não configurada. Defina BLOB_READ_WRITE_TOKEN no backend.');
    }

    const visit = await app.prisma.visit.findUnique({
      where: { id: parsed.data.id },
      include: {
        condominium: true,
        technician: true,
        checklistItems: {
          orderBy: { equipment: 'asc' },
        },
        files: {
          orderBy: { uploadedAt: 'desc' },
        },
        reports: {
          include: { file: true },
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!visit) {
      return fail(reply, 404, 'Visita não encontrada.');
    }

    const generatedAt = new Date();
    const imageAttachments = await loadImageAttachments(visit, request);
    const pdfBuffer = await generateTechnicalReportPdf({ visit, imageAttachments, generatedAt });
    const fileName = reportFileName(visit);
    const storagePath = `reports/${visit.id}/${Date.now()}-${fileName}`;
    let blob = null;

    try {
      blob = await put(storagePath, pdfBuffer, {
        access: 'private',
        contentType: 'application/pdf',
        addRandomSuffix: true,
      });

      const report = await withPrismaRetry(
        () =>
          app.prisma.$transaction(async (tx) => {
            const file = await tx.file.create({
              data: {
                fileName,
                fileType: 'technical_report_pdf',
                mimeType: 'application/pdf',
                storageKey: blob.pathname ?? storagePath,
                url: blob.url,
                size: pdfBuffer.length,
                uploadedBy: request.currentUser.id,
                publicUrl: blob.url,
                sizeBytes: pdfBuffer.length,
                category: 'technical_report_pdf',
              },
            });

            const latestReport = await tx.report.findFirst({
              where: { visitId: visit.id },
              orderBy: { version: 'desc' },
              select: { version: true },
            });

            return tx.report.create({
              data: {
                visitId: visit.id,
                fileId: file.id,
                version: (latestReport?.version ?? 0) + 1,
                generatedAt,
              },
              include: reportInclude,
            });
          }),
        { retries: 1 }
      );

      return reply.code(201).send(ok(report));
    } catch (error) {
      if (blob?.url) {
        await del(blob.url).catch((cleanupError) => request.log.warn(cleanupError));
      }

      request.log.error(
        {
          event: 'report_generation_failed',
          visitId: visit.id,
          error: {
            name: error?.name,
            message: error?.message,
            stack: error?.stack,
          },
        },
        'report generation failed'
      );

      return fail(reply, 500, 'Não foi possível gerar o relatório técnico.');
    }
  });

  app.get('/reports/:id/download', { preHandler: [requireRoles(reportAccessRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return fail(reply, 500, 'Download não configurado. Defina BLOB_READ_WRITE_TOKEN no backend.');
    }

    const report = await getReportOrFail(app, parsed.data.id, reply);
    if (!report.id) {
      return report;
    }

    if (!report.file) {
      return fail(reply, 404, 'Arquivo PDF do relatório não encontrado.');
    }

    try {
      const blob = await get(report.file.storageKey, {
        access: 'private',
        useCache: false,
      });

      if (!blob || blob.statusCode !== 200 || !blob.stream) {
        return fail(reply, 404, 'Arquivo PDF não encontrado no storage.');
      }

      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Length', String(report.file.size ?? report.file.sizeBytes ?? blob.blob.size));
      reply.header('Content-Disposition', `inline; filename="${encodeURIComponent(report.file.fileName)}"`);
      reply.header('Cache-Control', 'private, max-age=60');

      return reply.send(Readable.fromWeb(blob.stream));
    } catch (error) {
      request.log.error(
        {
          event: 'report_download_failed',
          reportId: report.id,
          error: {
            name: error?.name,
            message: error?.message,
            stack: error?.stack,
          },
        },
        'report download failed'
      );

      return fail(reply, 500, 'Falha ao baixar relatório técnico.');
    }
  });

  app.delete('/reports/:id', { preHandler: [requireRoles(writeRoles)] }, async (request, reply) => {
    const parsed = parseWithSchema(idParamsSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const report = await getReportOrFail(app, parsed.data.id, reply);
    if (!report.id) {
      return report;
    }

    if (report.file && process.env.BLOB_READ_WRITE_TOKEN) {
      await del(report.file.url ?? report.file.publicUrl ?? report.file.storageKey).catch((error) => {
        request.log.warn(
          {
            event: 'report_file_blob_delete_failed',
            reportId: report.id,
            fileId: report.file.id,
            error: {
              name: error?.name,
              message: error?.message,
            },
          },
          'failed to delete report file from blob'
        );
      });
    }

    await app.prisma.$transaction(async (tx) => {
      await tx.report.delete({
        where: { id: report.id },
      });

      if (report.file) {
        await tx.file.delete({
          where: { id: report.file.id },
        });
      }
    });

    return ok({ id: report.id, visitId: report.visitId });
  });
}
