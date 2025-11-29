import api from './api';

const usersAPI = {
  fetchAll: () => api.get('auth/users-list/'),
  create: (data) => api.post('auth/users/register/', data),
  update: (id, data) => api.put(`auth/users/${id}/update/`, data),
  deleteUser: (id) => api.delete(`auth/users/${id}/`),
  getOne: (id) => api.get(`auth/users/${id}/`),
  assignLocations: (id, data) => api.post(`auth/users/${id}/assign-locations/`, data),
};

export default usersAPI;
