import api from '../api';
import { authAPI } from '../../pages/loginView/authAPI';
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

const normalizeError = (err) =>
  err?.detail || err?.message || err?.non_field_errors?.[0] || 'Something went wrong';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login(username, password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      api.defaults.headers['Authorization'] = `Bearer ${data.access}`;
      const user = await authAPI.getMe().then(r => r.data);
      return { tokens: { access: data.access, refresh: data.refresh }, user };
    } catch (err) {
      return rejectWithValue(normalizeError(err.response?.data));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.getMe();
      return data;
    } catch (err) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers['Authorization'];
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token found');
      const { data } = await authAPI.refresh(refresh);
      localStorage.setItem('access_token', data.access);
      api.defaults.headers['Authorization'] = `Bearer ${data.access}`;
      return data.access;
    } catch {
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      delete api.defaults.headers.common["Authorization"];
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.token = payload.tokens.access;
        state.refreshToken = payload.tokens.refresh;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.isAuthenticated = false;
      })
      .addCase(fetchCurrentUser.pending, state => { state.loading = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = payload;
        state.isAuthenticated = false;
      })
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.token = payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, state => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  }
});

export const { logoutUser, clearError } = authSlice.actions;
export const selectAuthState = state => state.auth;
export const selectUser = createSelector([selectAuthState], auth => auth.user);
export const selectToken = createSelector([selectAuthState], auth => auth.token);
export const selectIsAuthenticated = createSelector([selectAuthState], auth => auth.isAuthenticated);
export const selectLoading = createSelector([selectAuthState], auth => auth.loading);
export const selectIsAdmin = state => state.auth.user?.role === 'admin';
export const selectIsManager = state => ['manager', 'admin'].includes(state.auth.user?.role);
export const selectIsStaff = state => ['staff', 'manager', 'admin'].includes(state.auth.user?.role);
export default authSlice.reducer;
