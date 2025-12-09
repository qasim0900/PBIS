// store/index.js
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import storage from 'redux-persist/lib/storage';
import countsReducer from './slices/countsSlice';
import { configureStore } from '@reduxjs/toolkit';
import inventoryReducer from './slices/inventorySlice';
import locationsReducer from './slices/locationsSlice';
import { persistStore, persistReducer } from 'redux-persist';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

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
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export default store;
