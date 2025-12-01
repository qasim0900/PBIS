// src/store/index.js   (ya store.js)

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
  whitelist: ['auth'], // sirf auth persist karo
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

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

// YE LINE ADD KARNA MAT BHULNA
export const persistor = persistStore(store);
export default store;
// Optional: agar aap chahein toh ek saath export bhi kar sakte ho
// export { store, persistor };