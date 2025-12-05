import api from './api';

const usersAPI = {
  // Fetch all users, optionally with query params (e.g., filters, pagination)
  getAll: (params = {}) => api.get('/auth/users-list/', { params }),

  // Fetch a single user by ID
  getOne: (id) => api.get(`/auth/${id}/`),

  // Create a new user
  create: (data) => api.post('/auth/register/', data),

  // Update an existing user by ID
  update: (id, data) => api.put(`/auth/${id}/update/`, data),

  // Delete a user by ID
  delete: (id) => api.delete(`/auth/${id}/`),

  // Assign locations to a user (bulk or single)
  assignLocations: (id, data) => api.post(`/auth/${id}/assign-locations/`, data),
};

export default usersAPI;
