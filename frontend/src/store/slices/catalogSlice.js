import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import catalogAPI from '../../services/catalogAPI';

const initialState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAllItems = createAsyncThunk(
  'catalog/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await catalogAPI.getAll(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchItem = createAsyncThunk(
  'catalog/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await catalogAPI.getOne(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createItem = createAsyncThunk(
  'catalog/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await catalogAPI.create(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateItem = createAsyncThunk(
  'catalog/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await catalogAPI.update(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteItem = createAsyncThunk(
  'catalog/delete',
  async (id, { rejectWithValue }) => {
    try {
      await catalogAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Slice
const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllItems
      .addCase(fetchAllItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results || [];
      })
      .addCase(fetchAllItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchItem
      .addCase(fetchItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItem.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createItem
      .addCase(createItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateItem
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.currentItem?.id === action.payload.id) state.currentItem = action.payload;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteItem
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) state.currentItem = null;
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentItem, clearError } = catalogSlice.actions;

export default catalogSlice.reducer;
