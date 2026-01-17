import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryAPI } from '../../api/index'; // updated import

const initialState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
};

// -----------------------------
// :: Async Thunks
// -----------------------------

export const fetchAllItems = createAsyncThunk(
  'inventory/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await inventoryAPI.list();
      console.log("data.results", data.results)
      return data.results ?? [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchItem = createAsyncThunk(
  'inventory/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await inventoryAPI.retrieve(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createItem = createAsyncThunk(
  'inventory/create',
  async (itemData, { rejectWithValue }) => {
    try {
      const { data } = await inventoryAPI.create(itemData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateItem = createAsyncThunk(
  'inventory/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: updated } = await inventoryAPI.update(id, data);
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const patchItem = createAsyncThunk(
  'inventory/patch',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: patched } = await inventoryAPI.patch(id, data);
      return patched;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteItem = createAsyncThunk(
  'inventory/delete',
  async (id, { rejectWithValue }) => {
    try {
      await inventoryAPI.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// -----------------------------
// :: Slice
// -----------------------------
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ----------------- fetchAllItems -----------------
      .addCase(fetchAllItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllItems.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload;
      })
      .addCase(fetchAllItems.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ----------------- fetchItem -----------------
      .addCase(fetchItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentItem = payload;
      })
      .addCase(fetchItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ----------------- createItem -----------------
      .addCase(createItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items.push(payload);
      })
      .addCase(createItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ----------------- updateItem -----------------
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) state.items[index] = payload;
        if (state.currentItem?.id === payload.id) state.currentItem = payload;
      })
      .addCase(updateItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ----------------- patchItem -----------------
      .addCase(patchItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) state.items[index] = payload;
        if (state.currentItem?.id === payload.id) state.currentItem = payload;
      })
      .addCase(patchItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // ----------------- deleteItem -----------------
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== payload);
        if (state.currentItem?.id === payload) state.currentItem = null;
      })
      .addCase(deleteItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearCurrentItem, setCurrentItem, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
