// services/customerService.js
import api from './api';

export const customerService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/customers', { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/customers/${id}`);
    return data.customer;
  },

  create: async (customerData) => {
    const { data } = await api.post('/customers', customerData);
    return data.customer;
  },

  update: async (id, customerData) => {
    const { data } = await api.put(`/customers/${id}`, customerData);
    return data.customer;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/customers/${id}`);
    return data;
  },

  addNote: async (id, content) => {
    const { data } = await api.post(`/customers/${id}/notes`, { content });
    return data;
  },

 
};
