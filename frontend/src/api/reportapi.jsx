// services/reportApi.js
import axios from 'axios';

import { API_BASE_URL } from './apiConfig';

// Create axios instance with JWT authentication
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// REPORT API FUNCTIONS
// ============================================================================

export const reportApi = {
  // Get weekly report summary
  getWeeklyReport: async () => {
    const response = await axiosInstance.get('/api/reports/summary?type=WEEKLY');
    return response.data;
  },

  // Get monthly report summary
  getMonthlyReport: async () => {
    const response = await axiosInstance.get('/api/reports/summary?type=MONTHLY');
    return response.data;
  },

  // Get report by type (generic)
  getReportByType: async (type) => {
    const response = await axiosInstance.get(`/api/reports/summary?type=${type}`);
    return response.data;
  }
};

export default reportApi;
