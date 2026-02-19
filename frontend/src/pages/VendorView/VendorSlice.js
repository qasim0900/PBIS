import { vendorsAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


//---------------------------------------
// :: Initial State
//---------------------------------------

/*
Defines default state structure for vendors slice
*/

const initialState = {
  vendors: [],
  loading: false,
  error: null,
};


//---------------------------------------
// :: Fetch Vendors (LIST)
//---------------------------------------

/*
Fetches vendor list from API
Returns: array of vendors
Handles errors and sets error state
*/

export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendorsAPI.list();
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch vendors'
      );
    }
  }
);


//---------------------------------------
// :: Create Vendor
//---------------------------------------
/*
Sends POST request to create a new vendor
Adds new vendor to state on success
*/

export const createVendor = createAsyncThunk(
  'vendors/createVendor',
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await vendorsAPI.create(vendorData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to create vendor'
      );
    }
  }
);


//---------------------------------------
// :: Update Vendor (PUT)
//---------------------------------------
/*
Sends PUT request to update an existing vendor
Updates the vendor in state on success
*/

export const updateVendor = createAsyncThunk(
  'vendors/updateVendor',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await vendorsAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to update vendor'
      );
    }
  }
);

//---------------------------------------
// :: Vendor Slice
//---------------------------------------
/*
Redux slice for vendor management
Includes reducers and extraReducers for async actions
*/


const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {


    //---------------------------------------
    // :: Clear Error
    //---------------------------------------
    /*
    Clears error state for vendors slice
    */


    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Vendor
      .addCase(createVendor.fulfilled, (state, action) => {
        state.vendors.unshift(action.payload);
      })

      // Update Vendor
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(v => v.id === action.payload.id);
        if (index !== -1) state.vendors[index] = action.payload;
      });
  },
});

export const { clearError } = vendorSlice.actions;
export default vendorSlice.reducer;
