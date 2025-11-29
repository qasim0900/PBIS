import axios from 'axios';

export const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ensure Authorization header present if token exists in localStorage
const storedAccessToken = localStorage.getItem('access_token') || localStorage.getItem('token');
if (storedAccessToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
}

// Request interceptor: ensure every request carries latest token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Callback listeners to notify when token refresh occurs
const _refreshListeners = [];
// refresh flow lock & queue
let isRefreshing = false;
let refreshSubscribers = [];
const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};
export const addAuthRefreshListener = (cb) => {
  _refreshListeners.push(cb);
  return () => {
    const idx = _refreshListeners.indexOf(cb);
    if (idx !== -1) _refreshListeners.splice(idx, 1);
  };
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response, reject immediately (network error)
    if (!error.response) {
      return Promise.reject(error);
    }

    // Only retry once
    if (error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token') || localStorage.getItem('refresh');
      if (!refreshToken) {
        // No refresh token, log out
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If refresh already happening, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      try {
        isRefreshing = true;
        // Call refresh API
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        // Save new access token
        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        // Notify listeners
        _refreshListeners.forEach((cb) => {
          try {
            cb(response.data.access);
          } catch (e) {
            // ignore callback errors
          }
        });
        // Notify any pending requests
        onRefreshed(response.data.access);
        isRefreshing = false;

        // Update headers and retry original request
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, log out
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    // All other errors
    return Promise.reject(error);
  }
);

// ---------------------- AUTH ----------------------
export const authAPI = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  getMe: () => api.get('/auth/me/'),
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),
};

// ---------------------- USERS ----------------------
export const usersAPI = {
  getAll: () => api.get('/users-list/'),
  register: (data) => api.post('/users/register/', data),
  getOne: (id) => api.get(`/users/${id}/`),
  update: (id, data) => api.put(`/users/${id}/update/`, data),
  assignLocations: (id, data) => api.post(`/users/${id}/assign-locations/`, data),
};

// ---------------------- LOCATIONS ----------------------
export const locationsAPI = {
  getAll: () => api.get('/locations/'),
  getOne: (id) => api.get(`/locations/${id}/`),
  update: (id, data) => api.put(`/locations/${id}/`, data),
  delete: (id) => api.delete(`/locations/${id}/`),
};

// ---------------------- CATALOG ----------------------
export const catalogAPI = {
  getAll: () => api.get('/catalog/items/'),
  getOne: (id) => api.get(`/catalog/items/${id}/`),
  create: (data) => api.post('/catalog/items/', data),
  update: (id, data) => api.put(`/catalog/items/${id}/`, data),
  delete: (id) => api.delete(`/catalog/items/${id}/`),
  exportExcel: () => api.get('/catalog/items/export_excel/', { responseType: 'blob' }),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/catalog/items/import_excel/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadTemplate: () => api.get('/catalog/items/template/', { responseType: 'blob' }),
};

// ------------------- LOCATION OVERRIDES -------------------
export const overridesAPI = {
  getAll: (locationId) => api.get('/location-overrides/', { params: { location: locationId } }),
  getOne: (id) => api.get(`/location-overrides/${id}/`),
  create: (data) => api.post('/location-overrides/', data),
  update: (id, data) => api.put(`/location-overrides/${id}/`, data),
  delete: (id) => api.delete(`/location-overrides/${id}/`),
};

// ---------------------- COUNTS ----------------------
export const countsAPI = {
  getSheets: (params) => api.get('/counts/sheets/', { params }),
  getSheet: (id) => api.get(`/counts/sheets/${id}/`),
  createSheet: (data) => api.post('/counts/sheets/', data),
  updateSheet: (id, data) => api.put(`/counts/sheets/${id}/`, data),
  ensureSheet: (locationId, date) => api.get('/counts/sheets/ensure_sheet/', { params: { location: locationId, date } }),
  submitSheet: (id) => api.post(`/counts/sheets/${id}/submit/`),
  getEntries: (sheetId) => api.get('/counts/entries/', { params: { sheet: sheetId } }),
  updateEntry: (id, data) => api.patch(`/counts/entries/${id}/`, data),
  getLowStock: () => api.get('/counts/entries/low_stock/'),
};

// ---------------------- REPORTS ----------------------
export const reportsAPI = {
  getAll: () => api.get('/reports/archives/'),
  getOne: (id) => api.get(`/reports/archives/${id}/`),
  create: (data) => api.post('/reports/archives/', data),
  delete: (id) => api.delete(`/reports/archives/${id}/`),
};

export default api;
