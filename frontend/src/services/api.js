// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: "https://tdc-matchmaker-backend-vjb7.onrender.com/api",
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
console.log(import.meta.env.VITE_API_URL);


// ── Request Interceptor: attach token ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tdc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle 401 ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tdc_token');
      localStorage.removeItem('tdc_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
