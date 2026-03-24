import { authAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const normalizeError = (err) =>
  err?.detail || err?.message || err?.non_field_errors?.[0] || 'An unknown error occurred.';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login({ username, password });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      const user = (await authAPI.me()).data;
      return { user, tokens: data };
    } catch (err) {
      return rejectWithValue(normalizeError(err.response?.data));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return (await authAPI.me()).data;
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    const refresh = getState().auth.refreshToken || localStorage.getItem('refresh_token');
    if (!refresh) return rejectWithValue('No refresh token available.');

    try {
      const { data } = await authAPI.refresh({ refresh });
      localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      return data.access;
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    logoutUser: (state) => {
      state.user = state.token = state.refreshToken = null;
      state.isAuthenticated = state.error = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
    clearError: (state) => { state.error = null; },
  },

  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Action failed';
      state.user = state.token = state.refreshToken = null;
      state.isAuthenticated = false;
    };

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.token = payload.tokens.access;
        state.refreshToken = payload.tokens.refresh;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, rejected)
      .addCase(fetchCurrentUser.pending, pending)
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, rejected)
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.token = payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, rejected);
  },
});

export const { logoutUser, clearError } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthState = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectLoading = (state) => state.auth.loading;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectIsManager = (state) => ['manager', 'admin'].includes(state.auth.user?.role);
export const selectIsStaff = (state) => ['staff', 'manager', 'admin'].includes(state.auth.user?.role);
