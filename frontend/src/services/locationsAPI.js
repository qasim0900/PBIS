import api from './api';

/**
 * Helper to normalize data for Django API
 * - Converts booleans to strings
 * - Can extend for nested objects if needed
 */
const normalizeData = (data) => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (typeof value === 'boolean') value = value ? 'true' : 'false';
      return [key, value];
    })
  );
};

const locationsAPI = {
  // Locations CRUD
  getAll: (params = {}) => api.get('/locations/', { params }),
  getOne: (id) => api.get(`/locations/${id}/`),
  create: (data) => api.post('/locations/', normalizeData(data)),
  update: (id, data) => api.patch(`/locations/${id}/`, normalizeData(data)),
  delete: (id) => api.delete(`/locations/${id}/`),

  // Location Overrides CRUD
  getOverrides: (params = {}) => api.get('/location-overrides/', { params }),
  createOverride: (data) => api.post('/location-overrides/', normalizeData(data)),
  updateOverride: (id, data) => api.put(`/location-overrides/${id}/`, normalizeData(data)),
  deleteOverride: (id) => api.delete(`/location-overrides/${id}/`),
};

export default locationsAPI;
