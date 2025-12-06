import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: localStorage.getItem('theme') || 'light',
  notification: null,
  modal: {
    open: false,
    type: null,
    data: null,
  },
  loading: {
    global: false,
    components: {},
  },
  reportsRefreshTrigger: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    showNotification: (state, action) => {
      state.notification = {
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 5000,
      };
    },
    hideNotification: (state) => {
      state.notification = null;
    },
    openModal: (state, action) => {
      state.modal = {
        open: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        open: false,
        type: null,
        data: null,
      };
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action) => {
      state.loading.components[action.payload.component] = action.payload.loading;
    },
    setReportsRefresh: (state) => {
      state.reportsRefreshTrigger = Date.now();
    },
  },
});

export const {
  toggleSidebar,
  toggleSidebarCollapse,
  setSidebarOpen,
  setSidebarCollapsed,
  setTheme,
  showNotification,
  hideNotification,
  openModal,
  closeModal,
  setGlobalLoading,
  setComponentLoading,
  setReportsRefresh,
} = uiSlice.actions;

export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectTheme = (state) => state.ui.theme;
export const selectNotification = (state) => state.ui.notification;
export const selectModal = (state) => state.ui.modal;

export default uiSlice.reducer;
