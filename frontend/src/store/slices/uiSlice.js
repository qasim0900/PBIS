// store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    notification: null, // { message, type: 'success' | 'error' | 'info' | 'warning' }
    sidebarCollapsed: false,
  },
  reducers: {
    showNotification: (state, action) => {
      state.notification = action.payload;
    },
    hideNotification: (state) => {
      state.notification = null;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const { showNotification, hideNotification, toggleSidebarCollapse, setSidebarCollapsed } = uiSlice.actions;
export const selectNotification = (state) => state.ui.notification;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;

export default uiSlice.reducer;