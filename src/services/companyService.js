import { apiRequest } from './apiClient';

const basePath = '/company';

export const companyService = {
  get() {
    return apiRequest(basePath);
  },
  update(payload) {
    return apiRequest(basePath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
