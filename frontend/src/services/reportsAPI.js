import api from './api';

export const reportsAPI = {
  getAll: (params) => api.get('/reports/archives/', { params }),
  getOne: (id) => api.get(`/reports/archives/${id}/`),
  create: (data) => api.post('/reports/archives/', data),
  delete: (id) => api.delete(`/reports/archives/${id}/`),
};

export default reportsAPI;