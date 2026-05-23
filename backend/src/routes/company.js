import { z } from 'zod';
import { defaultCompanySettings } from '../config/company.js';
import { requireRoles, writeRoles } from '../lib/authorization.js';
import { fail, ok, parseWithSchema } from '../lib/http.js';

const companyPayloadSchema = z.object({
  legalName: z.string().trim().min(1, 'Nome da empresa é obrigatório.'),
  cnpj: z.string().trim().optional().nullable(),
  addressLine: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().max(2, 'UF deve ter no máximo 2 caracteres.').optional().nullable(),
  legalRepresentative: z.string().trim().optional().nullable(),
  representativeCpf: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email('E-mail inválido.').optional().or(z.literal('')).nullable(),
});

function serializeCompanySettings(settings) {
  return {
    id: settings.id ?? null,
    legalName: settings.legalName ?? defaultCompanySettings.legalName,
    cnpj: settings.cnpj ?? '',
    addressLine: settings.addressLine ?? '',
    city: settings.city ?? '',
    state: settings.state ?? '',
    legalRepresentative: settings.legalRepresentative ?? '',
    representativeCpf: settings.representativeCpf ?? '',
    phone: settings.phone ?? '',
    email: settings.email ?? '',
    createdAt: settings.createdAt ?? null,
    updatedAt: settings.updatedAt ?? null,
  };
}

function cleanPayload(payload) {
  return {
    legalName: payload.legalName,
    cnpj: payload.cnpj || null,
    addressLine: payload.addressLine || null,
    city: payload.city || null,
    state: payload.state ? payload.state.toUpperCase() : null,
    legalRepresentative: payload.legalRepresentative || null,
    representativeCpf: payload.representativeCpf || null,
    phone: payload.phone || null,
    email: payload.email || null,
  };
}

export async function companyRoutes(app) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRoles(writeRoles));

  app.get('/', async () => {
    const settings = await app.prisma.companySettings.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    return ok(serializeCompanySettings(settings ?? defaultCompanySettings));
  });

  app.put('/', async (request, reply) => {
    const parsed = parseWithSchema(companyPayloadSchema, request.body);
    if (parsed.error) {
      return fail(reply, 400, 'Dados inválidos.', parsed.error);
    }

    const payload = cleanPayload(parsed.data);
    const currentSettings = await app.prisma.companySettings.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    const settings = currentSettings
      ? await app.prisma.companySettings.update({
          where: { id: currentSettings.id },
          data: payload,
        })
      : await app.prisma.companySettings.create({
          data: payload,
        });

    return ok(serializeCompanySettings(settings));
  });
}
