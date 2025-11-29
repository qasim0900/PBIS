import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import countsAPI from '../../services/countsAPI';


const initialState = {
  sheets: [],
  entries: [],
  selectedSheet: null,
  loading: false,
  error: null,
  filters: {
    location: '',
    status: '',
    dateRange: null,
  },
};

export const fetchCountSheets = createAsyncThunk(
  'counts/fetchSheets',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await countsAPI.getSheets(params);
      return response.data.results || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch count sheets');
    }
  }
);

export const createCountSheet = createAsyncThunk(
  'counts/createSheet',
  async (sheetData, { rejectWithValue }) => {
    try {
      const response = await countsAPI.createSheet(sheetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create count sheet');
    }
  }
);

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountSheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountSheets.fulfilled, (state, action) => {
        state.loading = false;
        state.sheets = action.payload;
      })
      .addCase(fetchCountSheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCountSheet.fulfilled, (state, action) => {
        state.sheets.unshift(action.payload);
      })
      .addCase(updateCountSheet.fulfilled, (state, action) => {
        const index = state.sheets.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sheets[index] = action.payload;
        }
      })
      .addCase(fetchCountEntries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCountEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(updateCountEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
      });
  },
});

export const { setSelectedSheet, setFilters, clearError, clearEntries } = countsSlice.actions;
export default countsSlice.reducer;
