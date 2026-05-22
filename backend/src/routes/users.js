import argon2 from 'argon2';
import { z } from 'zod';
import { requireRoles } from '../lib/authorization.js';
import { fail, getPagination, ok, paginationMeta, parseWithSchema } from '../lib/http.js';

const adminRoles = ['admin'];
const roleSchema = z.enum(['admin', 'manager', 'collaborator']);
const idSchema = z.object({ id: z.string().uuid() });

const listSchema = z.object({
  search: z.string().trim().optional(),
  role: roleSchema.optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value == null ? undefined : value === 'true')),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

const createSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: roleSchema,
  password: z.string().min(8),
  isActive: z.boolean().optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  role: roleSchema,
  isActive: z.boolean().optional(),
});

const passwordSchema = z.object({
  password: z.string().min(8),
});

const statusSchema = z.object({
  isActive: z.boolean(),
});

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function ensureUniqueEmail(app, email, userId = null) {
  const existingUser = await app.prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return !existingUser || existingUser.id === userId;
}

export async function userRoutes(app) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRoles(adminRoles));

  app.get('/', async (request, reply) => {
    const parsed = parseWithSchema(listSchema, request.query);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const { page, pageSize, skip, take } = getPagination(parsed.data);
    const where = {};

    if (parsed.data.search) {
      where.OR = [
        { name: { contains: parsed.data.search, mode: 'insensitive' } },
        { email: { contains: parsed.data.search, mode: 'insensitive' } },
      ];
    }

    if (parsed.data.role) {
      where.role = parsed.data.role;
    }

    if (typeof parsed.data.isActive === 'boolean') {
      where.isActive = parsed.data.isActive;
    }

    const [users, total] = await Promise.all([
      app.prisma.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take,
      }),
      app.prisma.user.count({ where }),
    ]);

    return ok(users.map(serializeUser), paginationMeta({ page, pageSize, total }));
  });

  app.get('/:id', async (request, reply) => {
    const parsed = parseWithSchema(idSchema, request.params);
    if (parsed.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', parsed.error);
    }

    const user = await app.prisma.user.findUnique({
      where: { id: parsed.data.id },
    });

    if (!user) {
      return fail(reply, 404, 'Usuário não encontrado.');
    }

    return ok(serializeUser(user));
  });

  app.post('/', async (request, reply) => {
    const parsed = parseWithSchema(createSchema, request.body);
    if (parsed.error) {
      return fail(reply, 400, 'Dados inválidos.', parsed.error);
    }

    const email = normalizeEmail(parsed.data.email);
    const emailIsAvailable = await ensureUniqueEmail(app, email);
    if (!emailIsAvailable) {
      return fail(reply, 409, 'Já existe um usuário com este e-mail.');
    }

    const passwordHash = await argon2.hash(parsed.data.password);
    const user = await app.prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        role: parsed.data.role,
        isActive: parsed.data.isActive ?? true,
        passwordHash,
      },
    });

    return reply.code(201).send(ok(serializeUser(user)));
  });

  app.put('/:id', async (request, reply) => {
    const params = parseWithSchema(idSchema, request.params);
    if (params.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', params.error);
    }

    const body = parseWithSchema(updateSchema, request.body);
    if (body.error) {
      return fail(reply, 400, 'Dados inválidos.', body.error);
    }

    if (params.data.id === request.currentUser.id && body.data.isActive === false) {
      return fail(reply, 400, 'Você não pode inativar o próprio usuário.');
    }

    const email = normalizeEmail(body.data.email);
    const emailIsAvailable = await ensureUniqueEmail(app, email, params.data.id);
    if (!emailIsAvailable) {
      return fail(reply, 409, 'Já existe um usuário com este e-mail.');
    }

    const userExists = await app.prisma.user.findUnique({
      where: { id: params.data.id },
      select: { id: true },
    });

    if (!userExists) {
      return fail(reply, 404, 'Usuário não encontrado.');
    }

    const user = await app.prisma.user.update({
      where: { id: params.data.id },
      data: {
        name: body.data.name,
        email,
        role: body.data.role,
        ...(typeof body.data.isActive === 'boolean' ? { isActive: body.data.isActive } : {}),
      },
    });

    return ok(serializeUser(user));
  });

  app.patch('/:id/password', async (request, reply) => {
    const params = parseWithSchema(idSchema, request.params);
    if (params.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', params.error);
    }

    const body = parseWithSchema(passwordSchema, request.body);
    if (body.error) {
      return fail(reply, 400, 'Dados inválidos.', body.error);
    }

    const userExists = await app.prisma.user.findUnique({
      where: { id: params.data.id },
      select: { id: true },
    });

    if (!userExists) {
      return fail(reply, 404, 'Usuário não encontrado.');
    }

    const passwordHash = await argon2.hash(body.data.password);
    const user = await app.prisma.user.update({
      where: { id: params.data.id },
      data: { passwordHash },
    });

    return ok(serializeUser(user));
  });

  app.patch('/:id/status', async (request, reply) => {
    const params = parseWithSchema(idSchema, request.params);
    if (params.error) {
      return fail(reply, 400, 'Parâmetros inválidos.', params.error);
    }

    const body = parseWithSchema(statusSchema, request.body);
    if (body.error) {
      return fail(reply, 400, 'Dados inválidos.', body.error);
    }

    if (params.data.id === request.currentUser.id && body.data.isActive === false) {
      return fail(reply, 400, 'Você não pode inativar o próprio usuário.');
    }

    const userExists = await app.prisma.user.findUnique({
      where: { id: params.data.id },
      select: { id: true },
    });

    if (!userExists) {
      return fail(reply, 404, 'Usuário não encontrado.');
    }

    const user = await app.prisma.user.update({
      where: { id: params.data.id },
      data: { isActive: body.data.isActive },
    });

    return ok(serializeUser(user));
  });
}
