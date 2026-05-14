import { ZodError } from 'zod';

export function ok(data, meta = {}) {
  return {
    data,
    meta,
    errors: [],
  };
}

export function fail(reply, statusCode, message, details = undefined) {
  return reply.code(statusCode).send({
    data: null,
    meta: {},
    errors: [
      {
        message,
        ...(details ? { details } : {}),
      },
    ],
  });
}

export function parseWithSchema(schema, value) {
  try {
    return {
      data: schema.parse(value),
      error: null,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      };
    }

    throw error;
  }
}

export function getPagination(query) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize ?? 20), 1), 100);
  const skip = (page - 1) * pageSize;

  return { page, pageSize, skip, take: pageSize };
}

export function paginationMeta({ page, pageSize, total }) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}
