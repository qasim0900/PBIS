import api from '../api';
const normalizeData = (data) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (typeof value === 'boolean') value = value ? 'true' : 'false';
      return [key, value];
    })
  );
};

const locationsAPI = {
  getAll: (params = {}) => api.get('/locations/', { params }),
  getOne: (id) => api.get(`/locations/${id}/`),
  create: (data) => api.post('/locations/', normalizeData(data)),
  update: (id, data) => api.patch(`/locations/${id}/`, normalizeData(data)),
  delete: (id) => api.delete(`/locations/${id}/`),
  getOverrides: (params = {}) => api.get('/location-overrides/', { params }),
  createOverride: (data) => api.post('/location-overrides/', normalizeData(data)),
  updateOverride: (id, data) => api.put(`/location-overrides/${id}/`, normalizeData(data)),
  deleteOverride: (id) => api.delete(`/location-overrides/${id}/`),
};

export default locationsAPI;
