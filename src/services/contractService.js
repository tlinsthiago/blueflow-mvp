import { apiFileRequest, apiRequest } from './apiClient';

const basePath = '/contracts';

export const contractService = {
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
  uploadSignedFile(id, file) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest(`${basePath}/${id}/signed-file`, {
      method: 'POST',
      body: formData,
    });
  },
  downloadSignedFile(id) {
    return apiFileRequest(`${basePath}/${id}/signed-file/download`);
  },
  deleteSignedFile(id) {
    return apiRequest(`${basePath}/${id}/signed-file`, {
      method: 'DELETE',
    });
  },
};
