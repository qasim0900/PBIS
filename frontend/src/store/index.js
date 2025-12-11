// store/index.js
import storage from "redux-persist/lib/storage";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";

import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import countsReducer from "./slices/countsSlice";
import inventoryReducer from "./slices/inventorySlice";
import locationsReducer from "./slices/locationsSlice";
import overridesReducer from "./slices/overrideSlice";
import catalogReducer from "./slices/catalogSlice";

// Persist only auth slice
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user"], // adjust if needed
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// -----------------------------
// Combine all reducers normally
// -----------------------------
const appReducer = combineReducers({
  auth: persistedAuthReducer,
  inventory: inventoryReducer,
  locations: locationsReducer,
  overrides: overridesReducer,
  counts: countsReducer,
  catalog: catalogReducer,
  users: usersReducer,
  ui: uiReducer,
});

// -----------------------------
// GLOBAL RESET REDUCER
// -----------------------------
const rootReducer = (state, action) => {
  if (action.type === "RESET_ALL") {
    // Clear redux-persist cache
    storage.removeItem("persist:auth");

    // Reset ALL slices
    state = undefined;
  }
  return appReducer(state, action);
};

// -----------------------------
// Configure store
// -----------------------------
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});


export const persistor = persistStore(store);
export default store;
