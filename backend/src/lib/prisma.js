import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__blueflowPrisma ??
  new PrismaClient({
    log: process.env.PRISMA_QUERY_LOG === 'true' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__blueflowPrisma = prisma;
}
