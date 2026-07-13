// services/partyApi.js
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
// PARTY API FUNCTIONS
// ============================================================================

export const partyApi = {
  // Get all parties
  getParties: async () => {
    const response = await axiosInstance.get('/api/parties');
    return response.data;
  },

  // Create party
  createParty: async (data) => {
    const response = await axiosInstance.post('/api/parties', data);
    return response.data;
  },

  // Update party
  updateParty: async (id, data) => {
    const response = await axiosInstance.put(`/api/parties/${id}`, data);
    return response.data;
  },

  // Delete party
  deleteParty: async (id) => {
    const response = await axiosInstance.delete(`/api/parties/${id}`);
    return response.data;
  }
};

export default partyApi;
