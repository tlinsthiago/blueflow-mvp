import { apiRequest } from './apiClient';

const basePath = '/users';

export const userService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(query ? `${basePath}?${query}` : basePath);
  },
  get(id) {
    return apiRequest(`${basePath}/${id}`);
  },
  create(payload) {
    return apiRequest(basePath, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  update(id, payload) {
    return apiRequest(`${basePath}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  updatePassword(id, password) {
    return apiRequest(`${basePath}/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    });
  },
  updateStatus(id, isActive) {
    return apiRequest(`${basePath}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};
