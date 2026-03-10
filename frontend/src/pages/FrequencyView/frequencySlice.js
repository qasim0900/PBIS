import { frequenciesAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

//---------------------------------------
// :: Helper: Parse Error
//---------------------------------------
const parseError = (err) => {
    if (err.response?.data) {
        const data = err.response.data;
        
        // Handle field-specific errors
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
        
        // Handle error/detail messages
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
            const error = parseError(err);
            return rejectWithValue(error);
        }
    }
);


export const createFrequency = createAsyncThunk(
    'frequencies/createFrequency',
    async (frequencyData, { rejectWithValue }) => {
        try {
            // Frontend validation
            if (!frequencyData.frequency_name || !frequencyData.frequency_name.trim()) {
                return rejectWithValue({
                    fieldErrors: { frequency_name: 'Inventory List name is required' },
                    message: 'Inventory List name is required'
                });
            }
            
            const { data } = await frequenciesAPI.create(frequencyData);
            return data;
        } catch (err) {
            const error = parseError(err);
            return rejectWithValue(error);
        }
    }
);


export const updateFrequency = createAsyncThunk(
    'frequencies/updateFrequency',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            // Frontend validation
            if (!id) {
                return rejectWithValue({
                    message: 'Inventory List ID is required'
                });
            }
            
            if (!data.frequency_name || !data.frequency_name.trim()) {
                return rejectWithValue({
                    fieldErrors: { frequency_name: 'Inventory List name is required' },
                    message: 'Inventory List name is required'
                });
            }
            
            const { data: updated } = await frequenciesAPI.update(id, data);
            return updated;
        } catch (err) {
            const error = parseError(err);
            return rejectWithValue(error);
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
            .addCase(fetchFrequencies.pending, (state) => { 
                state.loading = true; 
                state.error = null; 
            })
            .addCase(fetchFrequencies.fulfilled, (state, { payload }) => { 
                state.loading = false; 
                state.frequencies = payload;
                state.error = null;
            })
            .addCase(fetchFrequencies.rejected, (state, { payload }) => { 
                state.loading = false; 
                state.error = payload; 
            })

            // -------------------------------
            // :: Create Frequency
            // -------------------------------
            .addCase(createFrequency.pending, (state) => { 
                state.loading = true; 
                state.error = null; 
            })
            .addCase(createFrequency.fulfilled, (state, { payload }) => { 
                state.loading = false;
                state.frequencies.unshift(payload);
                state.error = null;
            })
            .addCase(createFrequency.rejected, (state, { payload }) => { 
                state.loading = false; 
                state.error = payload; 
            })

            // -------------------------------
            // :: Update Frequency
            // -------------------------------
            .addCase(updateFrequency.pending, (state) => { 
                state.loading = true; 
                state.error = null; 
            })
            .addCase(updateFrequency.fulfilled, (state, { payload }) => {
                state.loading = false;
                const index = state.frequencies.findIndex(f => f.id === payload.id);
                if (index !== -1) state.frequencies[index] = payload;
                state.error = null;
            })
            .addCase(updateFrequency.rejected, (state, { payload }) => { 
                state.loading = false; 
                state.error = payload; 
            });
    },
});

//---------------------------------------
// :: Export Actions & Reducer
//---------------------------------------
export const { clearError } = frequencySlice.actions;
export default frequencySlice.reducer;
