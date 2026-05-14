import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { condominiumRoutes } from './routes/condominiums.js';
import { healthRoutes } from './routes/health.js';
import { technicianRoutes } from './routes/technicians.js';
import { prisma } from './lib/prisma.js';
import { fail } from './lib/http.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  app.decorate('prisma', prisma);

  app.register(cors, {
    origin: true,
    credentials: true,
  });

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

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
