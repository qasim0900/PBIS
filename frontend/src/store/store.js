// store.js
import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';

// Reducers
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import countsReducer from './slices/countsSlice';
import inventoryReducer from './slices/inventorySlice';
import locationsReducer from './slices/locationsSlice';

// --------------------
// Persist Config (AUTH ONLY)
// --------------------
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'isAuthenticated', 'user'],
};

// Wrap only auth reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// --------------------
// Store
// --------------------
const store = configureStore({
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

// --------------------
// Persistor
// --------------------
export const persistor = persistStore(store);

export default store;
