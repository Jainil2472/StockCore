// services/emailApi.js
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
// EMAIL API FUNCTIONS
// ============================================================================

export const emailApi = {
  // Send purchase order email
  sendPurchaseOrderEmail: async (emailData) => {
    const response = await axiosInstance.post('/api/email/purchase-order', emailData);
    return response.data;
  }
};

export default emailApi;
