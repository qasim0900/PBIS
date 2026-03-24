import { locationsAPI } from '../../api/index';
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
  locations: [],
  overrides: [],
  selectedLocation: null,
  loading: false,
  error: null,
};

export const fetchLocations = createAsyncThunk(
  'locations/fetchLocations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await locationsAPI.list();
      return data.results || data;
    } catch (err) {
      const error = parseError(err);
      return rejectWithValue(error);
    }
  }
);

export const createLocation = createAsyncThunk(
  'locations/createLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      if (!locationData.name || !locationData.name.trim()) {
        return rejectWithValue({
          fieldErrors: { name: 'Location name is required' },
          message: 'Location name is required'
        });
      }

      const { data } = await locationsAPI.create(locationData);
      return data;
    } catch (err) {
      const error = parseError(err);
      return rejectWithValue(error);
    }
  }
);

export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue({
          message: 'Location ID is required'
        });
      }

      if (!data.name || !data.name.trim()) {
        return rejectWithValue({
          fieldErrors: { name: 'Location name is required' },
          message: 'Location name is required'
        });
      }

      const { data: updated } = await locationsAPI.update(id, data);
      return updated;
    } catch (err) {
      const error = parseError(err);
      return rejectWithValue(error);
    }
  }
);

const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setSelectedLocation: (state, { payload }) => {
      state.selectedLocation = payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.locations = payload;
        state.error = null;
      })
      .addCase(fetchLocations.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(createLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.locations.unshift(payload);
        state.error = null;
      })
      .addCase(createLocation.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.locations.findIndex(loc => loc.id === payload.id);
        if (index !== -1) state.locations[index] = payload;
        state.error = null;
      })
      .addCase(updateLocation.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedLocation, clearError } = locationsSlice.actions;
export default locationsSlice.reducer;
