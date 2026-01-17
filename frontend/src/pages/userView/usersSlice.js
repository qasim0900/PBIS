import { usersAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//---------------------------------------
// :: Initial State
//---------------------------------------
const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

//---------------------------------------
// :: Async Thunks
//---------------------------------------

// Fetch all users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await usersAPI.list();
      return data.results || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch users');
    }
  }
);

// Create a new user
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await usersAPI.register(userData);
      return data;
    } catch (err) {
      console.error('Create User Error:', err);
      return rejectWithValue(err.response?.data || 'Failed to create user');
    }
  }
);

// Update an existing user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: updated } = await usersAPI.update(id, data);
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update user');
    }
  }
);

//---------------------------------------
// :: Users Slice
//---------------------------------------
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Set selected user in state
    setSelectedUser: (state, { payload }) => {
      state.selectedUser = payload;
    },
    // Clear any error in state
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users = payload;
      })
      .addCase(fetchUsers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Create User
      .addCase(createUser.fulfilled, (state, { payload }) => {
        state.users.unshift(payload); // Add new user at the beginning
      })

      // Update User
      .addCase(updateUser.fulfilled, (state, { payload }) => {
        const idx = state.users.findIndex((u) => u.id === payload.id);
        if (idx !== -1) state.users[idx] = payload;
      });
  },
});

//---------------------------------------
// :: Exports
//---------------------------------------
export const { setSelectedUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;
