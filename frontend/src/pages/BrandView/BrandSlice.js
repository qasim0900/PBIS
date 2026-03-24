import { brandsAPI } from '../../api/index';
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
  brands: [],
  loading: false,
  error: null,
};

export const fetchBrands = createAsyncThunk(
  'brands/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await brandsAPI.list();
      return response.data.results || response.data;
    } catch (error) {
      const err = parseError(error);
      return rejectWithValue(err);
    }
  }
);

export const createBrand = createAsyncThunk(
  'brands/createBrand',
  async (brandData, { rejectWithValue }) => {
    try {
      if (!brandData.name || !brandData.name.trim()) {
        return rejectWithValue({
          fieldErrors: { name: 'Brand name is required' },
          message: 'Brand name is required'
        });
      }
      
      const response = await brandsAPI.create(brandData);
      return response.data;
    } catch (error) {
      const err = parseError(error);
      return rejectWithValue(err);
    }
  }
);

export const updateBrand = createAsyncThunk(
  'brands/updateBrand',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue({
          message: 'Brand ID is required'
        });
      }
      
      if (!data.name || !data.name.trim()) {
        return rejectWithValue({
          fieldErrors: { name: 'Brand name is required' },
          message: 'Brand name is required'
        });
      }
      
      const response = await brandsAPI.update(id, data);
      return response.data;
    } catch (error) {
      const err = parseError(error);
      return rejectWithValue(err);
    }
  }
);

export const deleteBrand = createAsyncThunk(
  'brands/deleteBrand',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue({
          message: 'Brand ID is required'
        });
      }
      
      await brandsAPI.remove(id);
      return id;
    } catch (error) {
      const err = parseError(error);
      return rejectWithValue(err);
    }
  }
);

const brandSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
        state.error = null;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.brands.findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.brands[index] = action.payload;
        state.error = null;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = state.brands.filter(b => b.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = brandSlice.actions;
export default brandSlice.reducer;
