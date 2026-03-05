import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    notification: null,
    sidebarCollapsed: true,
  },
  reducers: {
    showNotification: (state, action) => {
      state.notification = {
        ...action.payload,
        id: Date.now(),
        duration: action.payload.type === 'error' ? 8000 : 5000
      };
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