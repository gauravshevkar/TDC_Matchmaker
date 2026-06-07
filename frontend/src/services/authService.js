// services/authService.js
import api from './api';

export const authService = {
  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    if (data.token) {
      localStorage.setItem('tdc_token', data.token);
      localStorage.setItem('tdc_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('tdc_token');
    localStorage.removeItem('tdc_user');
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  getStoredUser: () => {
    try {
      const user = localStorage.getItem('tdc_user');
      return user ? JSON.parse(user) : null;
    } catch { return null; }
  },

  isAuthenticated: () => !!localStorage.getItem('tdc_token'),

  // Seed default users (development)
  // seedUsers: async () => {
  //   const { data } = await api.post('/auth/seed');
  //   return data;
  // },
};
