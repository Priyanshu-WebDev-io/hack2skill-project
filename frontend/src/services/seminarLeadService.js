import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const seminarLeadService = {
  // Public
  initiateRegistration: async (payload) => {
    const response = await api.post('/seminar-leads/initiate-registration', payload);
    return response.data;
  },

  processWebRegistration: async (payload) => {
    const response = await api.post('/seminar-leads/process-web-registration', payload);
    return response.data;
  },

  // Admin / Dashboard
  getSeminarLeads: async (params = {}) => {
    const response = await api.get('/seminar-leads', { params });
    return response.data;
  },
};

export default seminarLeadService;
