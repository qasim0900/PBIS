import axios from "axios";
import { showNotification } from "./uiSlice";

//-----------------------------------
// :: Base URL Configuration
//-----------------------------------

/*
This reads the API base URL from a Vite environment variable.
If not provided, it falls back to the local development server.
*/

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

//-----------------------------------
// :: Token Refresh State
//-----------------------------------

/*
These variables manage token refresh behavior.
- isRefreshing prevents multiple refresh calls
- failedQueue stores pending requests while token is refreshing
*/

let isRefreshing = false;
let failedQueue = [];

//-----------------------------------
// :: Auth Callback References
//-----------------------------------

/*
These callbacks are injected from outside (e.g., AuthProvider).
They allow Axios to:
- Refresh tokens
- Logout the user when authentication fails
*/

let refreshTokenCallback = null;
let logoutCallback = null;

/*
Registers authentication-related callbacks.
Called once during app initialization.
*/

export const setAuthCallbacks = ({ refreshTokenAction, logoutAction }) => {
  refreshTokenCallback = refreshTokenAction;
  logoutCallback = logoutAction;
};

//-----------------------------------
// :: Failed Request Queue Handler
//-----------------------------------

/*
Processes all queued requests after token refresh.
If refresh fails, all queued requests are rejected.
*/

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

//-----------------------------------
// :: Preconfigured Axios Instance
//-----------------------------------

/*
Creates a preconfigured Axios instance with:
- Base API URL
- JSON headers
- 15-second request timeout
*/

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

//-----------------------------------
// :: Axios Request Interceptor
//-----------------------------------

/*
Automatically attaches the access token from localStorage
to every outgoing request as a Bearer token.
*/

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

//-----------------------------------
// :: Axios Response Interceptor
//-----------------------------------

/*
Handles API errors globally:
- 403 or account-related errors → force logout
- 401 errors → attempt token refresh
- Queues requests during token refresh
- Displays user-friendly notifications
*/

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { status, data } = error.response || {};

    //-----------------------------------
    // :: Account / Permission Errors
    //-----------------------------------

    /*
    Logs the user out immediately if the account
    is invalid, deleted, or forbidden.
    */

    if (
      status === 403 ||
      ["User not found", "User deleted", "Invalid user"].includes(data?.detail)
    ) {
      if (logoutCallback) logoutCallback();
      showNotification({
        message: "Account issue. Logging out...",
        type: "error",
      });
      return Promise.reject(error);
    }

    //-----------------------------------
    // :: Unauthorized → Refresh Token
    //-----------------------------------

    /*
    Attempts to refresh the access token on 401 errors.
    Prevents multiple refresh calls and retries failed requests.
    */

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) {
        if (logoutCallback) logoutCallback();
        return Promise.reject(error);
      }

      // If refresh already in progress, queue the request
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

        showNotification({
          message: "Session expired. Please login again.",
          type: "error",
        });

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    //-----------------------------------
    // :: General Error Handling
    //-----------------------------------

    /*
    Displays a user-friendly error message
    for all other API failures.
    */

    const getErrorMessage = () => {
      if (data?.detail) return data.detail;
      if (data?.message) return data.message;
      if (data?.non_field_errors?.[0]) return data.non_field_errors[0];
      if (data?.username?.[0]) return `Username: ${data.username[0]}`;
      if (data?.email?.[0]) return `Email: ${data.email[0]}`;
      if (data?.password?.[0]) return `Password: ${data.password[0]}`;
      if (error.message === "Network Error") return "Unable to connect to server. Please check your connection.";
      if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
      return "Something went wrong. Please try again.";
    };

    showNotification({
      message: getErrorMessage(),
      type: "error",
    });

    return Promise.reject(error);
  }
);

//-----------------------------------
// :: Export Configured Axios Instance
//-----------------------------------

/*
Exports the fully configured Axios instance so it can be
reused across the application for all API calls.
*/

export default api;
