// src/store/index.js

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import inventoryReducer from './slices/inventorySlice';
import locationsReducer from './slices/locationsSlice';
import countsReducer from './slices/countsSlice';
import usersReducer from './slices/usersSlice';
import uiReducer from './slices/uiSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// STORE BANAYA
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    inventory: inventoryReducer,
    locations: locationsReducer,
    counts: countsReducer,
    users: usersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// PERSISTER BANAYA
export const persistor = persistStore(store);

// YE LINE SABSE ZAROORI – default export
export default store;