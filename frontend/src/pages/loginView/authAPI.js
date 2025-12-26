import api from '../api';

export const authAPI = {
  getMe: () => api.get('/auth/me/'),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
  login: (username, password) => api.post('/auth/login/', { username, password }),
};
