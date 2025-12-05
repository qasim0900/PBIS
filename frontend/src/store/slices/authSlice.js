import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import authAPI from '../../services/authAPI';
import api from '../../services/api';

// Async Thunks
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
      return userResponse.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Login failed');
    }
  }
);

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
      return rejectWithValue('Session expired');
    }
  }
);

// Initial State
const initialState = {
  user: null,
  token: localStorage.getItem('access_token'),
  loading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = localStorage.getItem('access_token');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      });
  },
});

// Actions
export const { logoutUser, clearError } = authSlice.actions;

// Memoized Selectors
const authState = (state) => state.auth;

export const selectAuth = createSelector(authState, (auth) => ({
  isAuthenticated: !!auth.token && !!auth.user,
  user: auth.user,
  token: auth.token,
  loading: auth.loading,
  error: auth.error,
}));

export const selectUser = createSelector(authState, (auth) => auth.user);

export const selectIsAdmin = createSelector(authState, (auth) =>
  auth.user?.role === 'admin' || auth.user?.is_superuser
);

export const selectIsManager = createSelector(
  authState,
  selectIsAdmin,
  (auth, isAdmin) => auth.user?.role === 'manager' || isAdmin
);

export default authSlice.reducer;
