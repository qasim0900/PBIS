import api from './api';

export const locationsAPI = {
  getAll: (params) => api.get('/locations/', { params }),
  getOne: (id) => api.get(`/locations/${id}/`),
  create: (data) => api.post('/locations/', data),   // correct
  update: (id, data) => api.patch(`/locations/${id}/`, data),
  delete: (id) => api.delete(`/locations/${id}/`),

  getOverrides: (params) => api.get('/location-overrides/', { params }),
  createOverride: (data) => api.post('/location-overrides/', data),
  updateOverride: (id, data) => api.put(`/location-overrides/${id}/`, data),
  deleteOverride: (id) => api.delete(`/location-overrides/${id}/`),
};
export default locationsAPI;