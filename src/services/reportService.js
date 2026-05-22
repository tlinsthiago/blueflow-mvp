import { apiFileRequest, apiRequest } from './apiClient';

const basePath = '/reports';

export const reportService = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(query ? `${basePath}?${query}` : basePath);
  },
  get(id) {
    return apiRequest(`${basePath}/${id}`);
  },
  download(id) {
    return apiFileRequest(`${basePath}/${id}/download`);
  },
  generateFromVisit(visitId) {
    return apiRequest(`/visits/${visitId}/generate-report`, {
      method: 'POST',
    });
  },
  remove(id) {
    return apiRequest(`${basePath}/${id}`, {
      method: 'DELETE',
    });
  },
};
