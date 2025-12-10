import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import overridesAPI from "../../services/overridesAPI";
import { showNotification } from "./uiSlice";

// -------------------------------------------------------------------
// Thunks
// -------------------------------------------------------------------

export const fetchOverrides = createAsyncThunk(
    "overrides/fetchOverrides",
    async (locationId, { rejectWithValue }) => {
        try {
            const data = await overridesAPI.getAll(locationId);
            return data; // full response { count, results }
        } catch (error) {
            return rejectWithValue("Failed to fetch overrides");
        }
    }
);

export const createOverride = createAsyncThunk(
    "overrides/createOverride",
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            const data = await overridesAPI.create(payload);
            dispatch(showNotification({ message: "Override created successfully", type: "success" }));
            return data;
        } catch (error) {
            dispatch(showNotification({ message: "Failed to create override", type: "error" }));
            return rejectWithValue(error.message);
        }
    }
);

export const updateOverride = createAsyncThunk(
    "overrides/updateOverride",
    async ({ id, payload }, { dispatch, rejectWithValue }) => {
        try {
            const data = await overridesAPI.update(id, payload);
            dispatch(showNotification({ message: "Override updated successfully", type: "success" }));
            return data;
        } catch (error) {
            dispatch(showNotification({ message: "Failed to update override", type: "error" }));
            return rejectWithValue(error.message);
        }
    }
);

export const deleteOverride = createAsyncThunk(
    "overrides/deleteOverride",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await overridesAPI.delete(id);
            dispatch(showNotification({ message: "Override deleted successfully", type: "success" }));
            return id;
        } catch (error) {
            dispatch(showNotification({ message: "Failed to delete override", type: "error" }));
            return rejectWithValue(error.message);
        }
    }
);

// -------------------------------------------------------------------
// Slice
// -------------------------------------------------------------------

const overridesSlice = createSlice({
    name: "overrides",
    initialState: {
        items: { count: 0, results: [] }, // store full response
        loading: false,
        error: null,
        selectedLocation: "",
    },
    reducers: {
        setSelectedLocation: (state, action) => {
            state.selectedLocation = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOverrides.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOverrides.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload || { count: 0, results: [] };

                // Ensure every result has a `count` property (use top-level count if item doesn't have count)
                const resultsWithCount = (payload.results || []).map((r) => ({
                    ...r,
                    count: r.count ?? payload.count ?? 1,
                }));

                state.items = {
                    count: payload.count ?? resultsWithCount.length,
                    results: resultsWithCount,
                };
            })
            .addCase(fetchOverrides.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create
            .addCase(createOverride.fulfilled, (state, action) => {
                // API returned created object in action.payload
                const created = action.payload;
                const countValue = state.items.count ?? 0;

                // Ensure created has count (fallback to existing count or 1)
                const createdWithCount = {
                    ...created,
                    count: created.count ?? countValue ?? 1,
                };

                state.items.results.push(createdWithCount);
                state.items.count = (state.items.count ?? 0) + 1;
            })

            // Update
            .addCase(updateOverride.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.items.results.findIndex((o) => o.id === updated.id);
                const fallbackCount = state.items.count ?? 1;
                const updatedWithCount = {
                    ...updated,
                    count: updated.count ?? (state.items.results[idx]?.count ?? fallbackCount),
                };

                if (idx !== -1) {
                    state.items.results[idx] = updatedWithCount;
                } else {
                    // If for any reason not found, push it
                    state.items.results.push(updatedWithCount);
                }
            })

            // Delete
            .addCase(deleteOverride.fulfilled, (state, action) => {
                const id = action.payload;
                state.items.results = state.items.results.filter((o) => o.id !== id);
                state.items.count = Math.max(0, (state.items.count ?? 1) - 1);
            });
    },
});

// -------------------------------------------------------------------
export const { setSelectedLocation } = overridesSlice.actions;
export default overridesSlice.reducer;
