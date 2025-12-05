import axios from 'axios';

export const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle token refresh listeners
let refreshListeners = [];

export const addAuthRefreshListener = (callback) => {
  refreshListeners.push(callback);
  return () => {
    refreshListeners = refreshListeners.filter((fn) => fn !== callback);
  };
};

export const triggerAuthRefresh = (newAccessToken) => {
  refreshListeners.forEach((callback) => callback(newAccessToken));
};

export default api;
