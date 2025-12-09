// services/api.js
import axios from 'axios';
import store from '../store';
import { refreshToken, logoutUser } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/uiSlice';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await store.dispatch(refreshToken()).unwrap();
        // Retry original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logoutUser());
        store.dispatch(showNotification({
          message: 'Session expired. Please login again.',
          type: 'error'
        }));
        return Promise.reject(refreshError);
      }
    }

    // Other errors - show notification
    const message = error.response?.data?.detail ||
                    error.response?.data?.message ||
                    error.response?.data?.non_field_errors?.[0] ||
                    error.message ||
                    'Something went wrong!';

    store.dispatch(showNotification({
      message,
      type: 'error'
    }));

    return Promise.reject(error);
  }
);

export default api;