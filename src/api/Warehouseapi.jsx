import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const warehouseApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/warehouses`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/warehouses`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/api/warehouses/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/api/warehouses/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};