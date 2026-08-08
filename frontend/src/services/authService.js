import apiClient from './apiClient';

const authService = {
  login: async (payload) => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },
  register: async (payload) => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },
  googleLogin: async (payload) => {
    const response = await apiClient.post('/auth/google', payload);
    return response.data;
  },
  verifyOtp: async (payload) => {
    const response = await apiClient.post('/auth/verify-otp', payload);
    return response.data;
  },
  resendOtp: async (payload) => {
    const response = await apiClient.post('/auth/resend-otp', payload);
    return response.data;
  },
};

export default authService;
