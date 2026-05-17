import { apiFileRequest, apiRequest } from './apiClient';

const basePath = '/visits';

export const visitService = {
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
  listFiles(id) {
    return apiRequest(`${basePath}/${id}/files`);
  },
  uploadFile(id, { file, fileType }) {
    const formData = new FormData();
    formData.append('fileType', fileType);
    formData.append('file', file);

    return apiRequest(`${basePath}/${id}/files`, {
      method: 'POST',
      body: formData,
    });
  },
  deleteFile(id, fileId) {
    return apiRequest(`${basePath}/${id}/files/${fileId}`, {
      method: 'DELETE',
    });
  },
  downloadFile(id, fileId) {
    return apiFileRequest(`${basePath}/${id}/files/${fileId}/download`);
  },
  generateReport(id) {
    return apiRequest(`${basePath}/${id}/generate-report`, {
      method: 'POST',
    });
  },
};
