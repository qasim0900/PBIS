import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import locationsAPI from '../../services/locationsAPI';


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
      const response = await locationsAPI.getAll();
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch locations');
    }
  }
);

export const createLocation = createAsyncThunk(
  'locations/createLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await locationsAPI.create(locationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create location');
    }
  }
);

export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await locationsAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update location');
    }
  }
);

export const deleteLocation = createAsyncThunk(
  'locations/deleteLocation',
  async (id, { rejectWithValue }) => {
    try {
      await locationsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete location');
    }
  }
);

export const fetchOverrides = createAsyncThunk(
  'locations/fetchOverrides',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationsAPI.getOverrides();
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch overrides');
    }
  }
);

const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
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
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.locations.unshift(action.payload);
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        const index = state.locations.findIndex(loc => loc.id === action.payload.id);
        if (index !== -1) {
          state.locations[index] = action.payload;
        }
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.locations = state.locations.filter(loc => loc.id !== action.payload);
      })
      .addCase(fetchOverrides.fulfilled, (state, action) => {
        state.overrides = action.payload;
      });
  },
});

export const { setSelectedLocation, clearError } = locationsSlice.actions;
export default locationsSlice.reducer;
