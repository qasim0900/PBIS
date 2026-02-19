import { frequenciesAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//---------------------------------------
// :: Initial State
//---------------------------------------
/*
Defines default structure for frequencies state
*/

const initialState = {
    frequencies: [],
    loading: false,
    error: null,
};

//---------------------------------------
// :: Async Thunks
//---------------------------------------
/*
Handles asynchronous API calls for frequencies
*/

export const fetchFrequencies = createAsyncThunk(
    'frequencies/fetchFrequencies',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await frequenciesAPI.list();
            return data.results || data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.detail || 'Failed to fetch frequencies');
        }
    }
);


export const createFrequency = createAsyncThunk(
    'frequencies/createFrequency',
    async (frequencyData, { rejectWithValue }) => {
        try {
            const { data } = await frequenciesAPI.create(frequencyData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to create Inventory List');
        }
    }
);


export const updateFrequency = createAsyncThunk(
    'frequencies/updateFrequency',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const { data: updated } = await frequenciesAPI.update(id, data);
            return updated;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to update Inventory List');
        }
    }
);

//---------------------------------------
// :: Slice
//---------------------------------------
/*
Creates Redux slice with reducers and extraReducers to handle async actions
*/

const frequencySlice = createSlice({
    name: 'frequencies',
    initialState,
    reducers: {
        // Clears error state
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            // -------------------------------
            // :: Fetch Frequencies
            // -------------------------------
            .addCase(fetchFrequencies.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchFrequencies.fulfilled, (state, { payload }) => { state.loading = false; state.frequencies = payload; })
            .addCase(fetchFrequencies.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

            // -------------------------------
            // :: Create Frequency
            // -------------------------------
            .addCase(createFrequency.fulfilled, (state, { payload }) => { state.frequencies.unshift(payload); })

            // -------------------------------
            // :: Update Frequency
            // -------------------------------
            .addCase(updateFrequency.fulfilled, (state, { payload }) => {
                const index = state.frequencies.findIndex(f => f.id === payload.id);
                if (index !== -1) state.frequencies[index] = payload;
            });
    },
});

//---------------------------------------
// :: Export Actions & Reducer
//---------------------------------------
export const { clearError } = frequencySlice.actions;
export default frequencySlice.reducer;
