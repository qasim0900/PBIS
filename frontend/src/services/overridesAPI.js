import api from './api';

export const overridesAPI = {
  getAll: (locationId) => api.get('/location-overrides/', { params: { location: locationId } }),
  getOne: (id) => api.get(`/location-overrides/${id}/`),
  create: (data) => api.post('/location-overrides/', data),
  update: (id, data) => api.put(`/location-overrides/${id}/`, data),
  patch: (id, data) => api.patch(`/location-overrides/${id}/`, data),
  delete: (id) => api.delete(`/location-overrides/${id}/`),

};

export default overridesAPI;