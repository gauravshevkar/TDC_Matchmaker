// services/matchService.js
import api from './api';

export const matchService = {
  suggest: async (customerId) => {
    const { data } = await api.get(`/matches/suggest/${customerId}`);
    return data;
  },

  send: async (payload) => {
    const { data } = await api.post('/matches/send', payload);
    return data;
  },

  getForCustomer: async (customerId) => {
    const { data } = await api.get(`/matches/${customerId}`);
    return data.matches;
  },

  updateStatus: async (matchId, status) => {
    const { data } = await api.put(`/matches/${matchId}/status`, { status });
    return data;
  },
};