import { apiRequest } from './apiClient';

const basePath = '/reports';

export const reportService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(query ? `${basePath}?${query}` : basePath);
  },
  get(id) {
    return apiRequest(`${basePath}/${id}`);
  },
  update(id, payload = {}) {
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
