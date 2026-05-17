import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { condominiumRoutes } from './routes/condominiums.js';
import { healthRoutes } from './routes/health.js';
import { technicianRoutes } from './routes/technicians.js';
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

  app.register(healthRoutes);
  app.register(authRoutes, { prefix: '/auth' });
  app.register(condominiumRoutes, { prefix: '/condominiums' });
  app.register(technicianRoutes, { prefix: '/technicians' });
  app.register(visitRoutes, { prefix: '/visits' });

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
