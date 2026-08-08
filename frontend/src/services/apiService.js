import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

const apiService = {
  // Participants
  registerParticipant: async (payload) => {
    const response = await api.post('/participants/register', payload);
    return response.data;
  },
  getParticipants: async (params = {}) => {
    const response = await api.get('/participants', { params });
    return response.data;
  },
  markAttendance: async (id) => {
    const response = await api.post(`/participants/${id}/attendance`);
    return response.data;
  },
  getParticipantById: async (id) => {
    const response = await api.get(`/participants/${id}`);
    return response.data;
  },
  
  // Seminars
  createSeminar: async (payload) => {
    const response = await api.post('/seminars', payload);
    return response.data;
  },
  getSeminars: async () => {
    const response = await api.get('/seminars');
    return response.data;
  },

  // Automation Logs
  getAutomationLogs: async () => {
    const response = await api.get('/automation/logs');
    return response.data;
  },

  // Certificates & Logs
  downloadCertificate: async (id) => {
    const response = await api.get(`/participants/${id}/certificate`, {
      responseType: 'blob',
    });
    return response.data;
  },
  getAutomationLogs: async () => {
    const response = await api.get('/automation/logs');
    return response.data;
  },
};

export default apiService;
