import uiReducer from "./pages/uiSlice";
import storage from "redux-persist/lib/storage";
import authReducer from "./pages/loginView/authSlice";
import usersReducer from "./pages/userView/usersSlice";
import countsReducer from "./pages/countView/countsSlice";
import { persistStore, persistReducer } from "redux-persist";
import catalogReducer from "./pages/catalogView/catalogSlice";
import inventoryReducer from "./pages/catalogView/inventorySlice";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import locationsReducer from "./pages/locationView/locationsSlice";
import overridesReducer from "./pages/overRidesView/overrideSlice";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user"],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
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

const rootReducer = (state, action) => {
  if (action.type === "RESET_ALL") {
    storage.removeItem("persist:auth");
    state = undefined;
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});


export const persistor = persistStore(store);
export default store;
