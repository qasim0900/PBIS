import api from '../api';
const BASE_URL = '/location-overrides/';

const handleRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const overridesAPI = {
  getAll: (locationId) => handleRequest(() =>
    api.get(BASE_URL, { params: locationId ? { location: locationId } : {} })
  ),
  create: (data) => handleRequest(() => api.post(BASE_URL, data)),
  getOne: (id) => handleRequest(() => api.get(`${BASE_URL}${id}/`)),
  delete: (id) => handleRequest(() => api.delete(`${BASE_URL}${id}/`)),
  update: (id, data) => handleRequest(() => api.put(`${BASE_URL}${id}/`, data)),
  patch: (id, data) => handleRequest(() => api.patch(`${BASE_URL}${id}/`, data)),
};

export default overridesAPI;
