import apiClient from './apiClient';

const automationService = {
  getAutomationLogs: async () => {
    const response = await apiClient.get('/automation/logs');
    return response.data;
  },
};

export default automationService;
