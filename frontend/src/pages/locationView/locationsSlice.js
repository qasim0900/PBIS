import { locationsAPI } from '../../api/index';
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
Defines the default structure of the locations slice
*/

const initialState = {
  locations: [],
  overrides: [],
  selectedLocation: null,
  loading: false,
  error: null,
};


//---------------------------------------
// :: Fetch Locations
//---------------------------------------

/*
Fetches all locations from the API.
Handles loading & error state.
*/

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



//---------------------------------------
// :: Create Location
//---------------------------------------

/*
Creates a new location via API
Adds new location to state on success
*/

export const createLocation = createAsyncThunk(
  'locations/createLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      // Frontend validation
      if (!locationData.name || !locationData.name.trim()) {
        return rejectWithValue({
          fieldErrors: { name: 'Location name is required' },
          message: 'Location name is required'
        });
      }

      if (!locationData.code || !locationData.code.trim()) {
        return rejectWithValue({
          fieldErrors: { code: 'Location code is required' },
          message: 'Location code is required'
        });
      }

      if (!locationData.frequency) {
        return rejectWithValue({
          fieldErrors: { frequency: 'Inventory List is required' },
          message: 'Inventory List is required'
        });
      }

      if (!locationData.timezone) {
        return rejectWithValue({
          fieldErrors: { timezone: 'Timezone is required' },
          message: 'Timezone is required'
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


//---------------------------------------
// :: Update Location
//---------------------------------------

/*
Updates an existing location via API
Updates the location in state on success
*/

export const updateLocation = createAsyncThunk(
  'locations/updateLocation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Frontend validation
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

      if (!data.code || !data.code.trim()) {
        return rejectWithValue({
          fieldErrors: { code: 'Location code is required' },
          message: 'Location code is required'
        });
      }

      if (!data.frequency) {
        return rejectWithValue({
          fieldErrors: { frequency: 'Inventory List is required' },
          message: 'Inventory List is required'
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



//---------------------------------------
// :: Slice Definition
//---------------------------------------

/*
Creates Redux slice with reducers and extraReducers for async thunks
*/

const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {


    //-----------------------------------
    // :: Set Selected Location
    //-----------------------------------

    /*
    Updates the currently selected location in state
    */

    setSelectedLocation: (state, { payload }) => {
      state.selectedLocation = payload;
    },

    //-----------------------------------
    // :: Clear Error
    //-----------------------------------

    /*
    Clears the error state
    */

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

//---------------------------------------
// :: Export Actions & Reducer
//---------------------------------------

export const { setSelectedLocation, clearError } = locationsSlice.actions;
export default locationsSlice.reducer;
