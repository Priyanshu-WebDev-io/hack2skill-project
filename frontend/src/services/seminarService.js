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
};

export default seminarService;
