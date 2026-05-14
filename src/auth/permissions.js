export const roles = {
  admin: 'admin',
  manager: 'manager',
  collaborator: 'collaborator',
};

export const fullAccessRoles = [roles.admin, roles.manager];

export function hasAnyRole(user, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return Boolean(user?.role && allowedRoles.includes(user.role));
}

export function canAccessContracts(user) {
  return hasAnyRole(user, fullAccessRoles);
}

export function canAccessCompany(user) {
  return hasAnyRole(user, fullAccessRoles);
}
