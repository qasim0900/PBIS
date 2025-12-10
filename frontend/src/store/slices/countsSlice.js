// src/store/slices/countsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import countsAPI from '../../services/countsAPI';

const initialState = {
  sheets: [],
  entries: [],
  lowStock: [],
  selectedSheet: null,
  loading: false,
  error: null,
  filters: {
    location: '',
    status: '',
    dateRange: null,
  },
};

// Fetch all sheets
export const fetchCountSheets = createAsyncThunk(
  'counts/fetchSheets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await countsAPI.getSheets(params.location, params.frequency, params.extraParams);
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch count sheets');
    }
  }
);

// Ensure or create a sheet
export const ensureCountSheet = createAsyncThunk(
  'counts/ensureSheet',
  async ({ locationId, frequency, includeEntries = true }, { rejectWithValue }) => {
    try {
      const response = await countsAPI.ensureSheet(locationId, frequency, includeEntries);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to ensure count sheet');
    }
  }
);

// Create a new sheet
export const createCountSheet = createAsyncThunk(
  'counts/createSheet',
  async (data, { rejectWithValue }) => {
    try {
      const response = await countsAPI.createSheet(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create count sheet');
    }
  }
);

// Update a sheet
export const updateCountSheet = createAsyncThunk(
  'counts/updateSheet',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await countsAPI.updateSheet(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update count sheet');
    }
  }
);

// Submit a sheet
export const submitCountSheet = createAsyncThunk(
  'counts/submitSheet',
  async (sheetId, { rejectWithValue }) => {
    try {
      const response = await countsAPI.submitSheet(sheetId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to submit sheet');
    }
  }
);

// Fetch entries for a sheet
export const fetchCountEntries = createAsyncThunk(
  'counts/fetchEntries',
  async (sheetId, { rejectWithValue }) => {
    try {
      const response = await countsAPI.getEntries(sheetId);
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch entries');
    }
  }
);

// Update an entry
export const updateCountEntry = createAsyncThunk(
  'counts/updateEntry',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await countsAPI.updateEntry(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update entry');
    }
  }
);

// Fetch low-stock entries
export const fetchLowStockEntries = createAsyncThunk(
  'counts/fetchLowStock',
  async (includeNear = false, { rejectWithValue }) => {
    try {
      const response = await countsAPI.getLowStock(includeNear);
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch low stock entries');
    }
  }
);

const countsSlice = createSlice({
  name: 'counts',
  initialState,
  reducers: {
    setSelectedSheet: (state, action) => {
      state.selectedSheet = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearEntries: (state) => {
      state.entries = [];
    },
    clearLowStock: (state) => {
      state.lowStock = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sheets
      .addCase(fetchCountSheets.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCountSheets.fulfilled, (state, action) => { state.loading = false; state.sheets = action.payload; })
      .addCase(fetchCountSheets.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Ensure Sheet
      .addCase(ensureCountSheet.fulfilled, (state, action) => { state.sheets.unshift(action.payload); })
      .addCase(ensureCountSheet.rejected, (state, action) => { state.error = action.payload; })

      // Create Sheet
      .addCase(createCountSheet.fulfilled, (state, action) => { state.sheets.unshift(action.payload); })
      .addCase(createCountSheet.rejected, (state, action) => { state.error = action.payload; })

      // Update Sheet
      .addCase(updateCountSheet.fulfilled, (state, action) => {
        const index = state.sheets.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.sheets[index] = action.payload;
      })
      .addCase(updateCountSheet.rejected, (state, action) => { state.error = action.payload; })

      // Submit Sheet
      .addCase(submitCountSheet.fulfilled, (state, action) => {
        const index = state.sheets.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state.sheets[index] = action.payload;
      })
      .addCase(submitCountSheet.rejected, (state, action) => { state.error = action.payload; })

      // Fetch Entries
      .addCase(fetchCountEntries.pending, (state) => { state.loading = true; })
      .addCase(fetchCountEntries.fulfilled, (state, action) => { state.loading = false; state.entries = action.payload; })
      .addCase(fetchCountEntries.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // Update Entry
      .addCase(updateCountEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(e => e.id === action.payload.id);
        if (index !== -1) state.entries[index] = action.payload;
      })
      .addCase(updateCountEntry.rejected, (state, action) => { state.error = action.payload; })

      // Low Stock
      .addCase(fetchLowStockEntries.fulfilled, (state, action) => { state.lowStock = action.payload; })
      .addCase(fetchLowStockEntries.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { setSelectedSheet, setFilters, clearError, clearEntries, clearLowStock } = countsSlice.actions;
export default countsSlice.reducer;
