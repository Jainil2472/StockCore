// services/transactionApi.js
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
// TRANSACTION API FUNCTIONS
// ============================================================================

export const transactionApi = {
  // Get all stock transactions
  getTransactions: async () => {
    const response = await axiosInstance.get('/api/stock/transactions');
    return response.data;
  }
};

export default transactionApi;
