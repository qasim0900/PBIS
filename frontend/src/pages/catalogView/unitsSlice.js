import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { unitsAPI } from '../../api/index.js';

// -------------------------
// :: Initial State
// -------------------------

const initialState = {
  units: [],
  currentUnit: null,
  loading: false,
  error: null,
};

// -------------------------
// :: Async Thunks
// -------------------------

export const fetchAllUnits = createAsyncThunk(
  'units/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await unitsAPI.list();
      return data.results || data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchUnit = createAsyncThunk(
  'units/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await unitsAPI.retrieve(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createUnit = createAsyncThunk(
  'units/create',
  async (unitData, { rejectWithValue }) => {
    try {
      const { data } = await unitsAPI.create(unitData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateUnit = createAsyncThunk(
  'units/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: updated } = await unitsAPI.update(id, data);
      return updated;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteUnit = createAsyncThunk(
  'units/delete',
  async (id, { rejectWithValue }) => {
    try {
      await unitsAPI.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// -------------------------
// :: Units Slice
// -------------------------

const unitsSlice = createSlice({
  name: 'units',
  initialState,
  
  reducers: {
    clearCurrentUnit: (state) => {
      state.currentUnit = null;
    },
    setCurrentUnit: (state, action) => {
      state.currentUnit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch All Units
      .addCase(fetchAllUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUnits.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.units = payload;
      })
      .addCase(fetchAllUnits.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Fetch Single Unit
      .addCase(fetchUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnit.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentUnit = payload;
      })
      .addCase(fetchUnit.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Create Unit
      .addCase(createUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUnit.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.units.push(payload);
      })
      .addCase(createUnit.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Update Unit
      .addCase(updateUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUnit.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.units.findIndex((unit) => unit.id === payload.id);
        if (index !== -1) state.units[index] = payload;
        if (state.currentUnit?.id === payload.id) state.currentUnit = payload;
      })
      .addCase(updateUnit.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Delete Unit
      .addCase(deleteUnit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUnit.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.units = state.units.filter((unit) => unit.id !== payload);
        if (state.currentUnit?.id === payload) state.currentUnit = null;
      })
      .addCase(deleteUnit.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearCurrentUnit, setCurrentUnit, clearError } = unitsSlice.actions;
export default unitsSlice.reducer;
