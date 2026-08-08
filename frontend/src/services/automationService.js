import apiClient from './apiClient';

const automationService = {
  getAutomationLogs: async ({ page = 1, limit = 25, search = '', status = '' } = {}) => {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    const response = await apiClient.get(`/automation/logs?${params.toString()}`);
    return response.data;
  },
};

export default automationService;
