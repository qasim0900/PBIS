import axios from "axios";
import store from "../store";
import { refreshToken, logoutUser } from "../store/slices/authSlice";
import { showNotification } from "../store/slices/uiSlice";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

// --------------------
// Request Interceptor
// --------------------
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// --------------------
// Response Interceptor
// --------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const state = store.getState();
    const refresh = state.auth.refreshToken;

    // Helper: logout user with notification
    const logoutWithMessage = (message = "Session expired. Please login again.") => {
      store.dispatch(logoutUser());
      store.dispatch(showNotification({ message, type: "error" }));
    };

    // Logout if user is deleted, forbidden, or invalid
    if (
      error.response?.data?.detail === "User not found" ||
      error.response?.data?.detail === "User deleted" ||
      error.response?.data?.detail === "Invalid user" ||
      error.response?.status === 403
    ) {
      logoutWithMessage("Your account is no longer available. Please login again.");
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If refresh token exists, try to refresh
      if (refresh) {
        try {
          await store.dispatch(refreshToken()).unwrap();
          return api(originalRequest);
        } catch (refreshError) {
          logoutWithMessage(
            refreshError?.response?.data?.detail || "Session expired. Please login again."
          );
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token → logout immediately
        logoutWithMessage();
        return Promise.reject(error);
      }
    }

    // Other errors: show notification
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.non_field_errors?.[0] ||
      error.message ||
      "Something went wrong!";

    store.dispatch(showNotification({ message, type: "error" }));

    return Promise.reject(error);
  }
);

export default api;
