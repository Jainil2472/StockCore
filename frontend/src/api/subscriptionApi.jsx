// services/api.js
import axios from 'axios';

import { API_BASE_URL } from './apiConfig';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add JWT token
api.interceptors.request.use(
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

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// SUBSCRIPTION API
// ============================================================================

export const subscriptionAPI = {
  // Get all available plans
  getPlans: async () => {
    const response = await api.get('/api/subscription/plans');
    return response.data;
  },

  // Create subscription (initiates Razorpay)
  createSubscription: async (planId, customerEmail, customerName) => {
    const response = await api.post('/api/subscription/create', {
      planId,
      customerEmail,
      customerName
    });
    return response.data; // Returns { subscriptionId, key }
  },

  // Get current active subscription
  getCurrentSubscription: async () => {
    const response = await api.get('/api/subscription/current');
    return response.data;
  },

  // Get usage statistics
  getUsage: async () => {
    const response = await api.get('/api/subscription/usage');
    return response.data;
  },

  // Upgrade subscription
  upgradeSubscription: async (planId) => {
    const response = await api.post('/api/subscription/upgrade', { planId });
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const response = await api.post('/api/subscription/cancel');
    return response.data;
  }
};

export default api;
