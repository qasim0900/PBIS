import { authAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//---------------------------------------
// :: normalizeError Function
//---------------------------------------


/*
Normalizes an error object to return a user-friendly message.
*/

const normalizeError = (err) =>
  err?.detail || err?.message || err?.non_field_errors?.[0] || 'An unknown error occurred.';


//---------------------------------------
// :: loginUser Function
//---------------------------------------


/*
Handles user login by authenticating, storing tokens, fetching user info, and returning the result (or a normalized error).
*/

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


//---------------------------------------
// :: fetchCurrentUser Function
//---------------------------------------


/*
Fetches the current logged-in user, and if the session is expired it clears tokens and returns an error.
*/

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


//---------------------------------------
// :: refresh Token Function
//---------------------------------------


/*
Refreshes the access token using the stored refresh token, and clears tokens if the refresh fails.
*/

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

//---------------------------------------
// :: initialState Function
//---------------------------------------


/*
A Redux slice that manages authentication state (user, tokens, loading, and errors) and handles login, session refresh, and logout actions.
*/

const initialState = {
  user: null,
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,
};

//---------------------------------------
// :: authSlice Function
//---------------------------------------


/*
A Redux slice that manages the authentication state (user, tokens, loading, and errors) for the application.
*/

const authSlice = createSlice({
  name: 'auth',
  initialState,

  //---------------------------------------
  // :: reducers
  //---------------------------------------


  /*
  Defines Redux reducers for logging out the user and clearing authentication errors.
  */

  reducers: {
    logoutUser: (state) => {
      state.user = state.token = state.refreshToken = null;
      state.isAuthenticated = state.error = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
    clearError: (state) => { state.error = null; },
  },

  //---------------------------------------
  // :: extra Reducers
  //---------------------------------------


  /*
  Handles common pending and rejected states for async auth actions (loading, error, and logout cleanup).
  */

  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Action failed';
      state.user = state.token = state.refreshToken = null;
      state.isAuthenticated = false;
    };

    builder

      //---------------------------------------
      // :: loginUser Case
      //---------------------------------------


      /*
      Handles login state updates: sets loading, saves user + tokens, and marks the user as authenticated.
      */

      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.user;
        state.token = payload.tokens.access;
        state.refreshToken = payload.tokens.refresh;
        state.isAuthenticated = true;
      })

      //---------------------------------------
      // :: loginUser Case
      //---------------------------------------


      /*
      Handles failed login and fetch-user states, updating loading/error and setting the user when successful.
      */

      .addCase(loginUser.rejected, rejected)
      .addCase(fetchCurrentUser.pending, pending)
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
      })

      //---------------------------------------
      // :: fetchCurrentUser Case
      //---------------------------------------


      /*
      Updates authentication state on token refresh success or failure, keeping the user logged in if the refresh succeeds and clearing auth on failure.
      */

      .addCase(fetchCurrentUser.rejected, rejected)
      .addCase(refreshToken.fulfilled, (state, { payload }) => {
        state.token = payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshToken.rejected, rejected);
  },
});


//---------------------------------------
// :: Exports auth actions
//---------------------------------------


/*
Exports auth actions and the reducer for handling authentication state in Redux.
*/

export const { logoutUser, clearError } = authSlice.actions;
export default authSlice.reducer;



//---------------------------------------
// :: Export Selectors 
//---------------------------------------


/*
Export Selector
*/

export const selectAuthState = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectLoading = (state) => state.auth.loading;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectIsManager = (state) => ['manager', 'admin'].includes(state.auth.user?.role);
export const selectIsStaff = (state) => ['staff', 'manager', 'admin'].includes(state.auth.user?.role);
