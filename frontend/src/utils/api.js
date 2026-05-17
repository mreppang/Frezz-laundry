import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://frezz-laundry-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token ke setiap request
// Dikirim TANPA prefix "Bearer " karena backend auth.js membaca raw Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = token;
  return config;
});

// Handle 401 secara global — redirect ke login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
