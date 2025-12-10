import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import authAPI from '../../services/authAPI';
import api from '../../services/api';

// --------------------
// Async Thunks
// --------------------

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(username, password);
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      const userResponse = await authAPI.getMe();
      return { tokens: { access, refresh }, user: userResponse.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Invalid credentials');
    }
  }
);

// Fetch current user
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      return response.data;
    } catch (err) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

// Refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token found');
      const response = await authAPI.refresh(refresh);
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return access;
    } catch (err) {
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

// --------------------
// Slice
// --------------------
const initialState = {
  user: null,
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
    },
    resetAllState: () => { },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;

      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = true;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.error = action.payload;
        state.isAuthenticated = true;
      })
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = true;
      });
  },
});

export const { logoutUser, clearError } = authSlice.actions;

// --------------------
// Memoized Selectors
// --------------------
export const selectAuthState = (state) => state.auth;

export const selectUser = createSelector([selectAuthState], (auth) => auth.user);
export const selectToken = createSelector([selectAuthState], (auth) => auth.token);
export const selectRefreshToken = createSelector([selectAuthState], (auth) => auth.refreshToken);
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => !!auth.token
);
export const selectAuth = (state) => state.auth;
export const selectLoading = createSelector([selectAuthState], (auth) => auth.loading);
export const selectError = createSelector([selectAuthState], (auth) => auth.error);
export const selectIsAdmin = (state) =>
  state.auth.user?.role === 'admin';

export const selectIsManager = (state) => {
  const role = state.auth.user?.role;
  return role === 'manager' || role === 'admin';
};

export const selectIsStaff = (state) => {
  const role = state.auth.user?.role;
  return role === 'staff' || role === 'manager' || role === 'admin';
};

export default authSlice.reducer;
