import apiClient from './apiClient';

const participantService = {
  registerParticipant: async (payload) => {
    const response = await apiClient.post('/participants/register', payload);
    return response.data;
  },
  getParticipants: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`/participants${params ? `?${params}` : ''}`);
    return response.data;
  },
  markAttendance: async (id) => {
    const response = await apiClient.post(`/participants/${id}/attendance`);
    return response.data;
  },
  getParticipantById: async (id) => {
    const response = await apiClient.get(`/participants/${id}`);
    return response.data;
  },
  downloadCertificate: async (id) => {
    const response = await apiClient.get(`/participants/${id}/certificate`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default participantService;
