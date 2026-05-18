import { apiRequest } from './apiClient';

export const dashboardService = {
  getSummary() {
    return apiRequest('/dashboard/summary');
  },
};
