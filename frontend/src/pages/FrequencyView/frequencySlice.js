import { frequenciesAPI } from '../../api/index';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const parseError = (err) => {
    if (err.response?.data) {
        const data = err.response.data;
        
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

const initialState = {
    frequencies: [],
    loading: false,
    error: null,
};

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

const frequencySlice = createSlice({
    name: 'frequencies',
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
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

export const { clearError } = frequencySlice.actions;
export default frequencySlice.reducer;
