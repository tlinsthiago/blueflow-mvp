import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { companyRoutes } from './routes/company.js';
import { condominiumRoutes } from './routes/condominiums.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { contractRoutes } from './routes/contracts.js';
import { healthRoutes } from './routes/health.js';
import { reportRoutes } from './routes/reports.js';
import { technicianRoutes } from './routes/technicians.js';
import { userRoutes } from './routes/users.js';
import { visitRoutes } from './routes/visits.js';
import { prisma } from './lib/prisma.js';
import { fail } from './lib/http.js';

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3333',
  'https://ftecautomacao.com.br',
  'https://www.ftecautomacao.com.br',
];

function getAllowedOrigins() {
  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...defaultAllowedOrigins, ...configuredOrigins]);
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (getAllowedOrigins().has(origin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
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

export function buildApp(options = {}) {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  app.decorate('prisma', prisma);

  app.register(cors, {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'), false);
    },
    credentials: true,
  });

  app.register(multipart);

  app.register(jwt, {
    secret: jwtSecret,
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    },
  });

  app.decorate('authenticate', async function authenticate(request, reply) {
    try {
      await request.jwtVerify();
    } catch {
      return fail(reply, 401, 'Token inválido ou ausente.');
    }

    const user = await app.prisma.user.findUnique({
      where: { id: request.user.sub },
    });

    if (!user || !user.isActive) {
      return fail(reply, 401, 'Usuário não encontrado ou inativo.');
    }

    request.currentUser = user;
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(
      {
        event: 'unhandled_request_error',
        method: request.method,
        url: request.url,
        error: serializeError(error),
      },
      'unhandled request error'
    );

    if (reply.sent) {
      return;
    }

    if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
      return fail(reply, 413, 'Arquivo excede o tamanho mÃ¡ximo permitido.');
    }

    if (error.code === 'P2021' || error.code === 'P2022') {
      return fail(reply, 500, 'Banco de dados nÃ£o estÃ¡ atualizado para esta operaÃ§Ã£o. Rode as migrations do Prisma em produÃ§Ã£o.');
    }

    return fail(reply, error.statusCode ?? 500, 'Erro interno ao processar a requisiÃ§Ã£o.');
  });

  app.register(healthRoutes);
  app.register(authRoutes, { prefix: '/auth' });
  app.register(companyRoutes, { prefix: '/company' });
  app.register(dashboardRoutes, { prefix: '/dashboard' });
  app.register(contractRoutes, { prefix: '/contracts' });
  app.register(condominiumRoutes, { prefix: '/condominiums' });
  app.register(reportRoutes);
  app.register(technicianRoutes, { prefix: '/technicians' });
  app.register(userRoutes, { prefix: '/users' });
  app.register(visitRoutes, { prefix: '/visits' });

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
