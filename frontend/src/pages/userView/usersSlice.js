import { usersAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const parseError = (err) => {
    if (err.response?.data) {
        const data = err.response.data;
        
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

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

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


export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
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
      const error = parseError(err);
      return rejectWithValue(error);
    }
  }
);


export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue({
          message: 'User ID is required'
        });
      }
      
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

const usersSlice = createSlice({
  name: 'users',
  initialState,

  reducers: {
    setSelectedUser: (state, { payload }) => {
      state.selectedUser = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
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



export const { setSelectedUser, clearError } = usersSlice.actions;
export default usersSlice.reducer;
