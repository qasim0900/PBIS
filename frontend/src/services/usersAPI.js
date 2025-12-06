import api from './api';

const usersAPI = {
  getAll: (params = {}) => api.get('/auth/users-list/', { params }),
  getOne: (id) => api.get(`/auth/${id}/`),
  create: (data) => api.post('/auth/register/', data),
  update: (id, data) => api.put(`/auth/${id}/update/`, data),
  deleteUser: (id) => api.delete(`/auth/${id}/`),
  assignLocations: (id, data) => api.post(`/auth/${id}/assign-locations/`, data),
};

export default usersAPI;
