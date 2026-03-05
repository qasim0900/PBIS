import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { showNotification } from "../../api/uiSlice";
import api from "../../api/index";

// -------------------------
// :: Thunks
// -------------------------

export const listReports = createAsyncThunk(
    "reports/listReports",
    async ({ location, frequency, latest_only }, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.reportsAPI.list({
                location,
                frequency,
                latest_only,
            });
            return res.data;
        } catch (err) {
            dispatch(showNotification({ message: "Failed to load reports", type: "error" }));
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const hideReport = createAsyncThunk(
    "reports/hideReport",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            await api.reportsAPI.hide(id);
            dispatch(showNotification({ message: "Report removed from UI", type: "success" }));
            return id;
        } catch (err) {
            dispatch(showNotification({ message: "Failed to remove report", type: "error" }));
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createReport = createAsyncThunk(
    "reports/createReport",
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.reportsAPI.create(payload);
            dispatch(showNotification({ message: "Report created successfully", type: "success" }));
            return res.data;
        } catch (err) {
            dispatch(showNotification({ message: "Failed to create report", type: "error" }));
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateReport = createAsyncThunk(
    "reports/updateReport",
    async ({ id, payload }, { rejectWithValue, dispatch }) => {
        try {
            const res = await api.reportsAPI.update(id, payload);
            dispatch(showNotification({ message: "Report updated successfully", type: "success" }));
            return res.data;
        } catch (err) {
            dispatch(showNotification({ message: "Failed to update report", type: "error" }));
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteReport = createAsyncThunk(
    "reports/deleteReport",
    async ({ location_id, frequency_id }, { rejectWithValue, dispatch }) => {
        try {
            await api.reportsAPI.delete({ location_id, frequency_id });
            dispatch(
                showNotification({
                    message: "Report deleted successfully",
                    type: "success",
                })
            );
            return { location_id, frequency_id };
        } catch (err) {
            dispatch(
                showNotification({
                    message: err.response?.data?.error || "Failed to delete report",
                    type: "error",
                })
            );
            return rejectWithValue(err.response?.data || err.message);
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
    reducers: {},
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
                state.data.unshift(action.payload);
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
                const idx = state.data.findIndex((r) => r.id === action.payload.id);
                if (idx !== -1) state.data[idx] = action.payload;
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

                state.data = Array.isArray(state.data)
                    ? state.data.filter(r => !deletedIds.includes(r.id))
                    : [];
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
                state.data.results = (state.data.results || []).filter((r) => r.id !== action.payload);
            })
            .addCase(hideReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default reportsSlice.reducer;
