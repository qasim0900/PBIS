import { usersAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//---------------------------------------
// :: Helper: Parse Error
//---------------------------------------
const parseError = (err) => {
    if (err.response?.data) {
        const data = err.response.data;
        
        // Handle field-specific errors
        if (typeof data === 'object' && !data.error && !data.detail) {
            const fieldErrors = {};
            Object.keys(data).forEach(field => {
                const messages = Array.isArray(data[field]) ? data[field] : [data[field]];
                fieldErrors[field] = messages.join(', ');
            });
            
            return {
                fieldErrors,
                message: 'Validation failed. Please check your input.',
                rawError: data
            };
        }
        
        // Handle error/detail messages
        return {
            message: data.error || data.detail || JSON.stringify(data),
            rawError: data
        };
    }
    
    return {
        message: err.message || 'An unexpected error occurred',
        rawError: err
    };
};

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
      const error = parseError(err);
      return rejectWithValue(error);
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
      // Validate required fields
      if (!userData.username) {
        return rejectWithValue({
          fieldErrors: { username: 'Username is required' },
          message: 'Username is required'
        });
      }
      
      if (!userData.email) {
        return rejectWithValue({
          fieldErrors: { email: 'Email is required' },
          message: 'Email is required'
        });
      }
      
      if (!userData.password) {
        return rejectWithValue({
          fieldErrors: { password: 'Password is required' },
          message: 'Password is required'
        });
      }
      
      const { data } = await usersAPI.register(userData);
      return data;
    } catch (err) {
      console.error('Create User Error:', err);
      const error = parseError(err);
      return rejectWithValue(error);
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
      // Validate ID
      if (!id) {
        return rejectWithValue({
          message: 'User ID is required'
        });
      }
      
      // Validate required fields
      if (data.username !== undefined && !data.username) {
        return rejectWithValue({
          fieldErrors: { username: 'Username cannot be empty' },
          message: 'Username cannot be empty'
        });
      }
      
      if (data.email !== undefined && !data.email) {
        return rejectWithValue({
          fieldErrors: { email: 'Email cannot be empty' },
          message: 'Email cannot be empty'
        });
      }
      
      const { data: updated } = await usersAPI.update(id, data);
      return updated;
    } catch (err) {
      const error = parseError(err);
      return rejectWithValue(error);
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
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      //---------------------------------------
      // :: Users Slice - Create User
      //---------------------------------------

      // Adds a newly created user to the users list.

      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users.unshift(payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      //---------------------------------------
      // :: Users Slice - Update User
      //---------------------------------------

      // Updates an existing user entry in the users list.

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.users.findIndex((u) => u.id === payload.id);
        if (idx !== -1) state.users[idx] = payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
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
