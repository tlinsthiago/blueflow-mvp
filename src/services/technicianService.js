import { apiRequest } from './apiClient';

const basePath = '/technicians';

export const technicianService = {
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
  remove(id) {
    return apiRequest(`${basePath}/${id}`, {
      method: 'DELETE',
    });
  },
};
