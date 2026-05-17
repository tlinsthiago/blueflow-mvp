import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.PRISMA_QUERY_LOG === 'true' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  });
}

export const prisma = globalForPrisma.__blueflowPrisma ?? createPrismaClient();

globalForPrisma.__blueflowPrisma = prisma;

function isPrismaConnectionError(error) {
  const message = `${error?.message ?? ''} ${error?.cause?.message ?? ''}`.toLowerCase();

  return (
    ['P1001', 'P1002', 'P1017', 'P2024'].includes(error?.code) ||
    message.includes('terminating connection') ||
    message.includes('server has closed the connection') ||
    message.includes('connection terminated') ||
    message.includes('connection closed') ||
    message.includes('socket') ||
    message.includes('timeout')
  );
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function withPrismaRetry(operation, options = {}) {
  const retries = options.retries ?? 1;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const shouldRetry = attempt < retries && isPrismaConnectionError(error);

      if (!shouldRetry) {
        throw error;
      }

      options.onRetry?.(error, attempt + 1);
      await prisma.$disconnect().catch(() => {});
      await wait(150 * (attempt + 1));
    }
  }

  throw new Error('Prisma retry failed unexpectedly.');
}
