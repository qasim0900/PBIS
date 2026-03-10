import { vendorsAPI } from '../../api/index';
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
    } catch (err) {
      const error = parseError(err);
      return rejectWithValue(error);
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
      // Frontend validation
      if (!vendorData.name || !vendorData.name.trim()) {
        return rejectWithValue({
          fieldErrors: { name: 'Vendor name is required' },
          message: 'Vendor name is required'
        });
      }

      const response = await vendorsAPI.create(vendorData);
      return response.data;
    } catch (err) {
      const error = parseError(err);
      return rejectWithValue(error);
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
      // Frontend validation
      if (!id) {
        return rejectWithValue({
          message: 'Vendor ID is required'
        });
      }

      if (!data.name || !data.name.trim()) {
        return rejectWithValue({
          fieldErrors: { name: 'Vendor name is required' },
          message: 'Vendor name is required'
        });
      }

      const response = await vendorsAPI.update(id, data);
      return response.data;
    } catch (err) {
      const error = parseError(err);
      return rejectWithValue(error);
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
        state.error = null;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Vendor
      .addCase(createVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors.unshift(action.payload);
        state.error = null;
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Vendor
      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendors.findIndex(v => v.id === action.payload.id);
        if (index !== -1) state.vendors[index] = action.payload;
        state.error = null;
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = vendorSlice.actions;
export default vendorSlice.reducer;
