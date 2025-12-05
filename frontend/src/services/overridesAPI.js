import api from './api';

/**
 * Smart API wrapper for Location Overrides
 *
 * Provides CRUD methods with optional params.
 * All methods return `response.data` directly for easier usage.
 */
const BASE_URL = '/location-overrides/';

const handleRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error; // Let caller handle notifications or retries
  }
};

const overridesAPI = {
  // Get all overrides, optionally filter by locationId
  getAll: (locationId) => handleRequest(() =>
    api.get(BASE_URL, { params: locationId ? { location: locationId } : {} })
  ),

  // Get single override by ID
  getOne: (id) => handleRequest(() => api.get(`${BASE_URL}${id}/`)),

  // Create new override
  create: (data) => handleRequest(() => api.post(BASE_URL, data)),

  // Update override completely
  update: (id, data) => handleRequest(() => api.put(`${BASE_URL}${id}/`, data)),

  // Partial update
  patch: (id, data) => handleRequest(() => api.patch(`${BASE_URL}${id}/`, data)),

  // Delete override
  delete: (id) => handleRequest(() => api.delete(`${BASE_URL}${id}/`)),
};

export default overridesAPI;
