import { countsAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//-----------------------------------
// :: initial State
//-----------------------------------

/*
This defines the initial Redux state for managing sheets, entries, filters, loading status, and errors.
*/

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


//-----------------------------------
// :: Handle Api Error Function
//-----------------------------------

/*
This helper extracts a meaningful error message from an API error response with a fallback message.
*/

const handleApiError = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.detail || error?.response?.data || error.message || fallback;


//-----------------------------------
// :: fetch Count Entries Function
//-----------------------------------

/*
This async thunk fetches count entries from the API and returns the results, 
or rejects with a formatted error message if the request fails.
*/

export const fetchCountEntries = createAsyncThunk('counts/fetchEntries', async (_, { rejectWithValue }) => {
  try {
    const { data } = await countsAPI.list();
    return data.results ?? data;
  } catch (err) { return rejectWithValue(handleApiError(err, 'Failed to fetch entries')); }
});


//-----------------------------------
// :: fetch Filter Function
//-----------------------------------

/*
This async thunk fetches filtered count entries based on location 
and date range, returning the results or an error message if the request fails.
*/

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

//-----------------------------------
// :: create Count Entry Function
//-----------------------------------

/*
This async thunk creates a new count entry via the API and returns the created data,
or rejects with a formatted error message on failure.
*/

export const createCountEntry = createAsyncThunk('counts/createEntry', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await countsAPI.create(payload);
    return data;
  } catch (err) { return rejectWithValue(handleApiError(err, 'Failed to create entry')); }
});


//-----------------------------------
// :: update Count Entry Function
//-----------------------------------

/*
This async thunk updates a count entry by ID via the API and returns the updated entry, 
or rejects with a formatted error message if it fails.
*/

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


//---------------------------------------
// :: fetch Low Stock Entries Function
//---------------------------------------

/*
This async thunk fetches all count entries, filters those with `on_hand_quantity` ≤ 5,
and returns them or an error message if the request fails.
*/

export const fetchLowStockEntries = createAsyncThunk('counts/fetchLowStock', async (_, { rejectWithValue }) => {
  try {
    const { data } = await countsAPI.list();
    return (data.results ?? data).filter(e => e.on_hand_quantity <= 5);
  } catch (err) { return rejectWithValue(handleApiError(err, 'Failed to fetch low stock entries')); }
});



//---------------------------------------
// :: submit Count Sheet Function
//---------------------------------------

/*
This async Redux thunk creates a new count sheet, bulk uploads the count entries, submits 
the sheet, and clears the entries while handling errors and notifications.
*/

export const submitCountSheet = createAsyncThunk(
  'counts/submitCountSheet',
  async (_, { getState, rejectWithValue, dispatch }) => {
    const state = getState().counts;
    const { selectedSheet } = state;

    // Selected sheet should contain entries array
    const entries = selectedSheet?.entries || [];

    if (!entries.length || !selectedSheet?.location) {
      return rejectWithValue('No entries or location selected');
    }

    try {
      const sheetPayload = {
        location: selectedSheet.location,
        count_date: new Date().toISOString().split('T')[0],
      };

      const sheetResponse = await countsAPI.createSheet(sheetPayload);
      const sheetId = sheetResponse.data.id;

      const bulkEntries = entries.map(entry => {
        const itemId = entry.item;

        if (!itemId) {
          throw new Error(`Cannot submit: Inventory item #${entry.id || '?'} has no valid item ID`);
        }

        return {
          sheet: sheetId,
          item: itemId,
          on_hand_quantity: Number(entry.on_hand_quantity) || 0,
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


//-----------------------------------
// :: delete Count Entry Function
//-----------------------------------

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


//-----------------------------------
// :: Count Slice Function
//-----------------------------------

/*
This slice defines reducers for updating selected sheet, entries, filters, and 
clearing errors or stored data within the counts state.
*/

const countsSlice = createSlice({
  name: 'counts',
  initialState: {
    entries: [],
    selectedSheet: null,
    loading: false,
    error: null,
  },


  //-----------------------------------
  // :: Reducers 
  //-----------------------------------

  /*
  These reducers update the counts state by setting the selected sheet, entries, and filters, 
  and by clearing errors or specific data arrays.
  */

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
  //-----------------------------------
  // :: Extra Reducers
  //-----------------------------------

  /*
  This `extraReducers` block handles loading, success, and error states for all count-related async actions in the Redux slice.
  */

  extraReducers: builder => {
    const handlePending = state => { state.loading = true; state.error = null; };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder

      //-----------------------------------
      // :: Fetch Entries Cases
      //-----------------------------------

      /*
      This handles the loading, success, and error states for fetching all count entries.
      */

      .addCase(fetchCountEntries.pending, handlePending)
      .addCase(fetchCountEntries.fulfilled, (state, { payload }) => { state.loading = false; state.entries = payload; })
      .addCase(fetchCountEntries.rejected, handleRejected)


      //-----------------------------------
      // :: Fetch filter Cases
      //-----------------------------------

      /*
      This handles the loading, success, and error states for fetching filtered entries and (incorrectly) sets 
      `selectedSheet` to the payload.
      */

      .addCase(fetchFilter.pending, handlePending)
      .addCase(fetchFilter.fulfilled, (state, { payload }) => {
        state.loading = false;

        const entriesWithItem = payload.map((i) => ({
          ...i,
          item: i.id,  // important
        }));

        state.entries = entriesWithItem;

      })
      .addCase(fetchFilter.rejected, handleRejected)


      //-----------------------------------
      // :: Create Entry Cases
      //-----------------------------------

      /*
      This handles the loading, success, and error states for creating a new count entry and adds it to the top of the entries list.
      */

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
      //-----------------------------------
      // :: Create Entry Cases
      //-----------------------------------

      /*
      This handles the loading, success, and error states for creating a new count entry and adds it to the top of the entries list.
      */

      .addCase(createCountEntry.pending, handlePending)
      .addCase(createCountEntry.fulfilled, (state, { payload }) => { state.loading = false; state.entries.unshift(payload); })
      .addCase(createCountEntry.rejected, handleRejected)


      //-----------------------------------
      // :: Update Entry Cases
      //-----------------------------------

      /*
      This handles loading, success, and error states for updating a count entry, replacing the matching entry 
      in the list when the update succeeds.
      */

      .addCase(updateCountEntry.pending, handlePending)
      .addCase(updateCountEntry.fulfilled, (state, { payload }) => {
        state.loading = false;
        const idx = state.entries.findIndex(e => e.id === payload.id);
        if (idx !== -1) state.entries[idx] = payload;
      })
      .addCase(updateCountEntry.rejected, handleRejected)




      //-----------------------------------
      // :: submit Count SheetCases
      //-----------------------------------

      /*
      Handles loading state and errors for the submitCountSheet async action in the Redux slice.
      */

      .addCase(submitCountSheet.pending, (state) => { state.loading = true; })
      .addCase(submitCountSheet.fulfilled, (state) => { state.loading = false; })
      .addCase(submitCountSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //-----------------------------------
      // :: Low Stock Cases
      //-----------------------------------

      /*
      This handles loading, success, and error states for fetching low-stock entries and stores them in `lowStock`.
      */

      .addCase(fetchLowStockEntries.pending, handlePending)
      .addCase(fetchLowStockEntries.fulfilled, (state, { payload }) => { state.loading = false; state.lowStock = payload; })
      .addCase(fetchLowStockEntries.rejected, handleRejected);


  }

});

//-----------------------------------
// :: Export Reducers
//-----------------------------------

/*
This exports the Redux actions and the reducer from the `countsSlice` for use across the app.
*/

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
