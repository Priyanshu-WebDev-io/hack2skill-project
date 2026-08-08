import apiClient from './apiClient';

const seminarService = {
  createSeminar: async (payload) => {
    const response = await apiClient.post('/seminars', payload);
    return response.data;
  },
  getSeminars: async () => {
    const response = await apiClient.get('/seminars');
    return response.data;
  },
  markCompleted: async (id) => {
    const response = await apiClient.post(`/seminars/${id}/complete`);
    return response.data;
  },
  generateZoomLink: async ({ topic, date }) => {
    const response = await apiClient.post('/seminars/generate-zoom', { topic, date });
    return response.data;
  },
};

export default seminarService;
