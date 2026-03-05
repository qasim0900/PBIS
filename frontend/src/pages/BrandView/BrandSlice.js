import { brandsAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//---------------------------------------
// :: Initial State
//---------------------------------------

/*
Defines default state structure for brands slice
*/

const initialState = {
  brands: [],
  loading: false,
  error: null,
};

//---------------------------------------
// :: Fetch Brands (LIST)
//---------------------------------------

/*
Fetches brand list from API
Returns: array of brands
Handles errors and sets error state
*/

export const fetchBrands = createAsyncThunk(
  'brands/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await brandsAPI.list();
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to fetch brands'
      );
    }
  }
);

//---------------------------------------
// :: Create Brand
//---------------------------------------

/*
Sends POST request to create a new brand
Adds new brand to state on success
*/

export const createBrand = createAsyncThunk(
  'brands/createBrand',
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await brandsAPI.create(brandData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to create brand'
      );
    }
  }
);

//---------------------------------------
// :: Update Brand (PUT)
//---------------------------------------

/*
Sends PUT request to update an existing brand
Updates the brand in state on success
*/

export const updateBrand = createAsyncThunk(
  'brands/updateBrand',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await brandsAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to update brand'
      );
    }
  }
);

//---------------------------------------
// :: Brand Slice
//---------------------------------------

/*
Redux slice for brand management
Includes reducers and extraReducers for async actions
*/

const brandSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {

    //---------------------------------------
    // :: Clear Error
    //---------------------------------------
    /*
    Clears error state for brands slice
    */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Brands
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Brand
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands.unshift(action.payload);
      })

      // Update Brand
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.brands.findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.brands[index] = action.payload;
      });
  },
});

export const { clearError } = brandSlice.actions;
export default brandSlice.reducer;
