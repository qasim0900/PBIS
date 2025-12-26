import axios from 'axios';
import store from '../index';
import { showNotification } from './uiSlice';
import { refreshToken, logoutUser } from './loginView/authSlice';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state?.auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const state = store.getState();
    const refreshTokenValue = state?.auth?.refreshToken;

    if (
      ["User not found", "User deleted", "Invalid user"].includes(
        error.response?.data?.detail
      ) ||
      error.response?.status === 403
    ) {
      store.dispatch(
        logoutUser()
      );
      store.dispatch(
        showNotification({
          message: "Account invalid. Please login again.",
          type: "error",
        })
      );
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!refreshTokenValue) {
        store.dispatch(logoutUser());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await store.dispatch(refreshToken()).unwrap();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        store.dispatch(logoutUser());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    const errorMessage = error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    store.dispatch(
      showNotification({
        message: errorMessage,
        type: 'error',
      })
    );

    return Promise.reject(error);
  }
);

export default api;
