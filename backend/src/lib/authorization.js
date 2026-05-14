import { fail } from './http.js';

export const writeRoles = ['admin', 'manager'];

export function requireRoles(roles) {
  return async function authorize(request, reply) {
    if (!request.currentUser || !roles.includes(request.currentUser.role)) {
      return fail(reply, 403, 'Você não tem permissão para executar esta ação.');
    }
  };
}
