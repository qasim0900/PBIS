import { countsAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  sheets: [],
  entries: [],
  lowStock: [],
  filteredItems: [],
  selectedSheet: null,
  loading: false,
  error: null,
  filters: { location: '', status: '', dateRange: null },
};


const handleApiError = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.detail || error?.response?.data || error.message || fallback;


export const fetchCountEntries = createAsyncThunk('counts/fetchEntries', async (_, { rejectWithValue }) => {
  try {
    const { data } = await countsAPI.list();
    return data.results ?? data;
  } catch (err) { return rejectWithValue(handleApiError(err, 'Failed to fetch entries')); }
});


export const fetchFilter = createAsyncThunk(
  "counts/fetchFilter",
  async ({ location, dateRange }, { rejectWithValue }) => {
    try {
      const { data } = await countsAPI.listFilter({ location, dateRange });
      return data.results ?? [];
    } catch (err) {
      return rejectWithValue(handleApiError(err, "Failed to fetch filtered items"));
    }
  }
);

export const createCountEntry = createAsyncThunk('counts/createEntry', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await countsAPI.create(payload);
    return data;
  } catch (err) { return rejectWithValue(handleApiError(err, 'Failed to create entry')); }
});


export const updateCountEntry = createAsyncThunk(
  "counts/updateCountEntry",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await countsAPI.patch(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || "Failed to update count entry"
      );
    }
  }
);


export const fetchLowStockEntries = createAsyncThunk('counts/fetchLowStock', async (_, { rejectWithValue }) => {
  try {
    const { data } = await countsAPI.list();
    return (data.results ?? data).filter(e => e.on_hand_quantity <= 5);
  } catch (err) { return rejectWithValue(handleApiError(err, 'Failed to fetch low stock entries')); }
});



export const submitCountSheet = createAsyncThunk(
  'counts/submitCountSheet',
  async (_, { getState, rejectWithValue, dispatch }) => {
    const state = getState().counts;
    const { selectedSheet } = state;

    const entries = selectedSheet?.entries || [];

    if (!entries.length || !selectedSheet?.location) {
      return rejectWithValue('No entries or location selected');
    }

    try {
      const sheetPayload = {
        location: selectedSheet.location,
        frequency: selectedSheet.frequency,
        count_date: new Date().toISOString().split('T')[0],
      };

      const sheetResponse = await countsAPI.createSheet(sheetPayload);
      const sheetId = sheetResponse.data.id;

      const entriesToSubmit = entries.filter(entry =>
        entry.on_hand_quantity && Number(entry.on_hand_quantity) > 0
      );

      if (entriesToSubmit.length === 0) {
        return rejectWithValue('No entries with counts to submit');
      }

      const bulkEntries = entriesToSubmit.map(entry => {
        const itemId = entry.item;

        if (!itemId) {
          throw new Error(`Cannot submit: Inventory item #${entry.id || '?'} has no valid item ID`);
        }

        return {
          sheet: sheetId,
          item: itemId,
          on_hand_quantity: Number(entry.on_hand_quantity),
          notes: entry.notes || '',
          par_level: entry.par_level,
          order_point: entry.order_point,
        };
      });

      await countsAPI.create(bulkEntries);
      await countsAPI.submitSheet(sheetId);
      return { sheetId, message: 'Submitted successfully' };
    } catch (err) {
      console.error('Submit count sheet failed:', err);
      return rejectWithValue(handleApiError(err, 'Failed to submit count sheet'));
    }
  }
);


export const deleteCountEntry = createAsyncThunk(
  "counts/deleteCountEntry",
  async (id, { rejectWithValue }) => {
    try {
      await countsAPI.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || "Failed to delete count entry"
      );
    }
  }
);


const countsSlice = createSlice({
  name: 'counts',
  initialState: {
    entries: [],
    selectedSheet: null,
    loading: false,
    error: null,
  },

  reducers: {
    setSelectedSheet: (state, action) => {
      state.selectedSheet = action.payload;
    },
    setEntries: (state, action) => {
      state.entries = action.payload;
    },
    updateSelectedSheetEntry: (state, action) => {
      const { id, data } = action.payload;
      if (!state.selectedSheet?.entries) return;

      const idx = state.selectedSheet.entries.findIndex(e => e.id === id);
      if (idx !== -1) {
        state.selectedSheet.entries[idx] = {
          ...state.selectedSheet.entries[idx],
          ...data
        };
      }
      const idx2 = state.entries.findIndex(e => e.id === id);
      if (idx2 !== -1) {
        state.entries[idx2] = {
          ...state.entries[idx2],
          ...data
        };
      }
    },
    clearEntries: (state) => {
      state.entries = [];
    },
    clearLowStock: (state) => {
      state.lowStock = [];
    },
    clearFilteredItems: (state) => {
      state.filteredItems = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    const handlePending = state => { state.loading = true; state.error = null; };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder

      .addCase(fetchCountEntries.pending, handlePending)
      .addCase(fetchCountEntries.fulfilled, (state, { payload }) => { state.loading = false; state.entries = payload; })
      .addCase(fetchCountEntries.rejected, handleRejected)

      .addCase(fetchFilter.pending, handlePending)
      .addCase(fetchFilter.fulfilled, (state, { payload }) => {
        state.loading = false;

        const entriesWithItem = payload.map((i) => ({
          ...i,
          item: i.id,
        }));

        state.entries = entriesWithItem;

      })
      .addCase(fetchFilter.rejected, handleRejected)

      .addCase(deleteCountEntry.pending, handlePending)
      .addCase(deleteCountEntry.fulfilled, (state, { payload: id }) => {
        state.loading = false;
        state.entries = state.entries.filter(e => e.id !== id);

        if (state.selectedSheet?.entries) {
          state.selectedSheet.entries =
            state.selectedSheet.entries.filter(e => e.id !== id);
        }
      })
      .addCase(deleteCountEntry.rejected, handleRejected)

      .addCase(createCountEntry.pending, handlePending)
      .addCase(createCountEntry.fulfilled, (state, { payload }) => { state.loading = false; state.entries.unshift(payload); })
      .addCase(createCountEntry.rejected, handleRejected)

      .addCase(updateCountEntry.pending, handlePending)
      .addCase(updateCountEntry.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.entries.findIndex(e => e.id === payload.id);
        if (idx !== -1) state.entries[idx] = payload;
      })
      .addCase(updateCountEntry.rejected, handleRejected)

      .addCase(submitCountSheet.pending, (state) => { state.loading = true; })
      .addCase(submitCountSheet.fulfilled, (state) => { state.loading = false; })
      .addCase(submitCountSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchLowStockEntries.pending, handlePending)
      .addCase(fetchLowStockEntries.fulfilled, (state, { payload }) => { state.loading = false; state.lowStock = payload; })
      .addCase(fetchLowStockEntries.rejected, handleRejected);

  }

});

export const {
  setSelectedSheet,
  updateSelectedSheetEntry,
  setEntries,
  setFilters,
  clearError,
  clearEntries,
  clearLowStock,
  clearFilteredItems,
} = countsSlice.actions;
export default countsSlice.reducer;
