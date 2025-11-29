import api from './api';

export const authAPI = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  getMe: () => api.get('/auth/me/'),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
};

export default authAPI;