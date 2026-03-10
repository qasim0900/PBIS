import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { showNotification } from "../../api/uiSlice";
import api from "../../api/index";

// -------------------------
// :: Helper: Parse Error
// -------------------------
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

// -------------------------
// :: Thunks
// -------------------------

export const listReports = createAsyncThunk(
    "reports/listReports",
    async ({ location, frequency, latest_only }, { rejectWithValue, dispatch }) => {
        try {
            // Validate inputs
            if (!location) {
                const error = { message: 'Location is required to load reports' };
                dispatch(showNotification({ message: error.message, type: "warning" }));
                return rejectWithValue(error);
            }
            
            if (!frequency) {
                const error = { message: 'Inventory List is required to load reports' };
                dispatch(showNotification({ message: error.message, type: "warning" }));
                return rejectWithValue(error);
            }
            
            const res = await api.reportsAPI.list({
                location,
                frequency,
                latest_only,
            });
            
            return res.data;
        } catch (err) {
            const error = parseError(err);
            dispatch(showNotification({ 
                message: error.message || "Failed to load reports. Please check your connection.", 
                type: "error" 
            }));
            return rejectWithValue(error);
        }
    }
);

export const hideReport = createAsyncThunk(
    "reports/hideReport",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            if (!id) {
                const error = { message: 'Report ID is required' };
                dispatch(showNotification({ message: error.message, type: "error" }));
                return rejectWithValue(error);
            }
            
            await api.reportsAPI.hide(id);
            dispatch(showNotification({ message: "✓ Report removed from view", type: "success" }));
            return id;
        } catch (err) {
            const error = parseError(err);
            dispatch(showNotification({ 
                message: error.message || "Failed to remove report", 
                type: "error" 
            }));
            return rejectWithValue(error);
        }
    }
);

export const createReport = createAsyncThunk(
    "reports/createReport",
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            // Validate payload
            if (!payload || typeof payload !== 'object') {
                const error = { message: 'Invalid report data' };
                dispatch(showNotification({ message: error.message, type: "error" }));
                return rejectWithValue(error);
            }
            
            const res = await api.reportsAPI.create(payload);
            dispatch(showNotification({ message: "✓ Report created successfully", type: "success" }));
            return res.data;
        } catch (err) {
            const error = parseError(err);
            dispatch(showNotification({ 
                message: error.message || "Failed to create report", 
                type: "error" 
            }));
            return rejectWithValue(error);
        }
    }
);

export const updateReport = createAsyncThunk(
    "reports/updateReport",
    async ({ id, payload }, { rejectWithValue, dispatch }) => {
        try {
            if (!id) {
                const error = { message: 'Report ID is required' };
                dispatch(showNotification({ message: error.message, type: "error" }));
                return rejectWithValue(error);
            }
            
            if (!payload || typeof payload !== 'object') {
                const error = { message: 'Invalid report data' };
                dispatch(showNotification({ message: error.message, type: "error" }));
                return rejectWithValue(error);
            }
            
            const res = await api.reportsAPI.update(id, payload);
            dispatch(showNotification({ message: "✓ Report updated successfully", type: "success" }));
            return res.data;
        } catch (err) {
            const error = parseError(err);
            dispatch(showNotification({ 
                message: error.message || "Failed to update report", 
                type: "error" 
            }));
            return rejectWithValue(error);
        }
    }
);

export const deleteReport = createAsyncThunk(
    "reports/deleteReport",
    async ({ location_id, frequency_id }, { rejectWithValue, dispatch }) => {
        try {
            // Validate inputs
            if (!location_id) {
                const error = { message: 'Location is required to delete report' };
                dispatch(showNotification({ message: error.message, type: "error" }));
                return rejectWithValue(error);
            }
            
            const res = await api.reportsAPI.delete({ location_id, frequency_id });
            
            // Extract deleted info from response
            const deletedCount = res.data?.reports_deleted || 0;
            const entriesCount = res.data?.count_entries_deleted || 0;
            
            dispatch(
                showNotification({
                    message: `✓ Deleted ${deletedCount} report(s) and ${entriesCount} entries`,
                    type: "success",
                })
            );
            
            return { 
                location_id, 
                frequency_id,
                deleted_ids: res.data?.deleted_ids || []
            };
        } catch (err) {
            const error = parseError(err);
            dispatch(
                showNotification({
                    message: error.message || "Failed to delete report. Please try again.",
                    type: "error",
                })
            );
            return rejectWithValue(error);
        }
    }
);

// -------------------------
// :: Slice
// -------------------------

const reportsSlice = createSlice({
    name: "reports",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearReports: (state) => {
            state.data = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // LIST
            .addCase(listReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(listReports.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(listReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // CREATE
            .addCase(createReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReport.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(state.data)) {
                    state.data.unshift(action.payload);
                } else if (state.data?.results) {
                    state.data.results.unshift(action.payload);
                }
                state.error = null;
            })
            .addCase(createReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // UPDATE
            .addCase(updateReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateReport.fulfilled, (state, action) => {
                state.loading = false;
                const dataArray = Array.isArray(state.data) ? state.data : state.data?.results || [];
                const idx = dataArray.findIndex((r) => r.id === action.payload.id);
                if (idx !== -1) {
                    if (Array.isArray(state.data)) {
                        state.data[idx] = action.payload;
                    } else if (state.data?.results) {
                        state.data.results[idx] = action.payload;
                    }
                }
                state.error = null;
            })
            .addCase(updateReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // DELETE
            .addCase(deleteReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReport.fulfilled, (state, action) => {
                state.loading = false;
                const deletedIds = action.payload?.deleted_ids || [];
                
                if (Array.isArray(state.data)) {
                    state.data = state.data.filter(r => !deletedIds.includes(r.id));
                } else if (state.data?.results) {
                    state.data.results = state.data.results.filter(r => !deletedIds.includes(r.id));
                }
                state.error = null;
            })
            .addCase(deleteReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // HIDE
            .addCase(hideReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(hideReport.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(state.data)) {
                    state.data = state.data.filter((r) => r.id !== action.payload);
                } else if (state.data?.results) {
                    state.data.results = state.data.results.filter((r) => r.id !== action.payload);
                }
                state.error = null;
            })
            .addCase(hideReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearReports } = reportsSlice.actions;
export default reportsSlice.reducer;
