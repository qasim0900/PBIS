// store/index.js
import storage from 'redux-persist/lib/storage';
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import countsReducer from './slices/countsSlice';
import inventoryReducer from './slices/inventorySlice';
import locationsReducer from './slices/locationsSlice';
import overridesReducer from './slices/overrideSlice';
import catalogReducer from '../store/slices/catalogSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    inventory: inventoryReducer,
    locations: locationsReducer,
    overrides: overridesReducer,
    counts: countsReducer,
    catalog: catalogReducer,
    users: usersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export default store;
