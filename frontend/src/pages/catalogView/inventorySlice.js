import catalogAPI from '../../pages/catalogView/catalogAPI';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalItems: 0,
  },
  filters: {
    search: '',
    category: '',
  },
};

export const fetchCatalogItems = createAsyncThunk(
  'inventory/fetchItems',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await catalogAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch items');
    }
  }
);

export const createCatalogItem = createAsyncThunk(
  'inventory/createItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await catalogAPI.create(itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create item');
    }
  }
);

export const updateCatalogItem = createAsyncThunk(
  'inventory/updateItem',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await catalogAPI.patch(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update item');
    }
  }
);

export const deleteCatalogItem = createAsyncThunk(
  'inventory/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      await catalogAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete item');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || action.payload;
        if (action.payload.count) {
          state.pagination.totalItems = action.payload.count;
          state.pagination.totalPages = Math.ceil(action.payload.count / 50);
        }
      })
      .addCase(fetchCatalogItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCatalogItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCatalogItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createCatalogItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCatalogItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCatalogItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { setSelectedItem, setFilters, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
