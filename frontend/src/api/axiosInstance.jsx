import axios from "axios";
import { API_BASE_URL } from './apiConfig';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Auto attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Auto logout on token expiry (401) — no alert, clean redirect
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();                        // clear all stored data
      window.location.href = "/login_signup";      // force redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
