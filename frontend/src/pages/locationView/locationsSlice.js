import { locationsAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch locations');
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
      const { data } = await locationsAPI.create(locationData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to create location');
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
      const { data: updated } = await locationsAPI.update(id, data);
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update location');
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
      })
      .addCase(fetchLocations.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(createLocation.fulfilled, (state, { payload }) => {
        state.locations.unshift(payload);
      })

      .addCase(updateLocation.fulfilled, (state, { payload }) => {
        const index = state.locations.findIndex(loc => loc.id === payload.id);
        if (index !== -1) state.locations[index] = payload;
      });
  },
});

//---------------------------------------
// :: Export Actions & Reducer
//---------------------------------------

export const { setSelectedLocation, clearError } = locationsSlice.actions;
export default locationsSlice.reducer;
