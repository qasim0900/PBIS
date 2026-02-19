import { usersAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//---------------------------------------
// :: Initial State
//---------------------------------------

/*
Defines the default Redux state for user management, including the user 
list, selected user, loading status, and error handling.
*/

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

//---------------------------------------
// :: fetchUsers Thunks
//---------------------------------------

/*
Asynchronously fetches the list of users from the API and handles success or failure states using createAsyncThunk.
*/

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


//---------------------------------------
// :: createUser Thunks
//---------------------------------------

/*
Asynchronously creates a new user via the API, returning the created user on success or a detailed error on failure.
*/

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


//---------------------------------------
// :: updateUser Thunks
//---------------------------------------

/*
Asynchronously updates an existing user via the API and returns the updated user on success, or an error message on failure.
*/

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

/*
Creates a Redux slice for managing users, including state, reducers, and async actions for fetching, creating, and updating users.
*/

const usersSlice = createSlice({
  name: 'users',
  initialState,

  //---------------------------------------
  // :: reducers
  //---------------------------------------

  /*
  Defines reducers to set the selected user and clear any existing error state.
  */

  reducers: {
    setSelectedUser: (state, { payload }) => {
      state.selectedUser = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  //---------------------------------------
  // :: extraReducers
  //---------------------------------------

  /*
  Renders the login page and handles user authentication with state management and navigation.
  */

  extraReducers: (builder) => {
    builder

      //---------------------------------------
      // :: Users Slice - Fetch Users
      //---------------------------------------

      // Handles fetching users: loading state, success data, and errors.

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

      //---------------------------------------
      // :: Users Slice - Create User
      //---------------------------------------

      // Adds a newly created user to the users list.

      .addCase(createUser.fulfilled, (state, { payload }) => {
        state.users.unshift(payload);
      })

      //---------------------------------------
      // :: Users Slice - Update User
      //---------------------------------------

      // Updates an existing user entry in the users list.

      .addCase(updateUser.fulfilled, (state, { payload }) => {
        const idx = state.users.findIndex((u) => u.id === payload.id);
        if (idx !== -1) state.users[idx] = payload;
      });
  },
});



//---------------------------------------
// :: Export Selecor and reducer
//---------------------------------------

/*
// Export Redux actions and the users reducer for state management.
*/

export const { setSelectedUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;
