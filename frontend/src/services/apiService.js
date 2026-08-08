import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const apiService = {
  // Authentication
  login: async (payload) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
  register: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  googleLogin: async (payload) => {
    const response = await api.post('/auth/google', payload);
    return response.data;
  },
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify/${token}`);
    return response.data;
  },

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
