import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000;

let isRefreshing = false;
let failedQueue = [];

let refreshTokenCallback = null;
let logoutCallback = null;
let notificationCallback = null;

export const setAuthCallbacks = ({ refreshTokenAction, logoutAction, showNotificationAction }) => {
  refreshTokenCallback = refreshTokenAction;
  logoutCallback = logoutAction;
  notificationCallback = showNotificationAction;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { status, data } = error.response || {};

    if (
      status === 403 ||
      ["User not found", "User deleted", "Invalid user"].includes(data?.detail)
    ) {
      if (logoutCallback) logoutCallback();
      if (notificationCallback) {
        notificationCallback({
          message: "Account issue. Logging out...",
          type: "error",
        });
      }
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) {
        if (logoutCallback) logoutCallback();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const response = await axios.post(`${BASE_URL}/api/token/refresh/`, { refresh });
        const newAccessToken = response.data.access;
        localStorage.setItem("access_token", newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (logoutCallback) logoutCallback();

        if (notificationCallback) {
          notificationCallback({
            message: "Session expired. Please login again.",
            type: "error",
          });
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const getErrorMessage = () => {
      if (data?.detail) return data.detail;
      if (data?.message) return data.message;
      if (data?.error) return data.error;
      if (data?.non_field_errors?.[0]) return data.non_field_errors[0];
      if (data?.username?.[0]) return `Username: ${data.username[0]}`;
      if (data?.email?.[0]) return `Email: ${data.email[0]}`;
      if (data?.password?.[0]) return `Password: ${data.password[0]}`;
      if (error.message === "Network Error") return "Unable to connect to server. Please check your connection.";
      if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
      return "Something went wrong. Please try again.";
    };

    if (notificationCallback) {
      notificationCallback({
        message: getErrorMessage(),
        type: "error",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
