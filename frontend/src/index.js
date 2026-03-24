import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import { configureStore, combineReducers } from "@reduxjs/toolkit";

import uiReducer from './api/uiSlice';
import authReducer from "./pages/loginView/authSlice";
import usersReducer from "./pages/userView/usersSlice";
import brandReducer from "./pages/BrandView/BrandSlice";
import countsReducer from "./pages/countView/countsSlice";
import vendorReducer from "./pages/VendorView/VendorSlice";
import reportsReducer from "./pages/reportsView/reportsSlice";
import catalogReducer from "./pages/catalogView/catalogSlice";
import inventoryReducer from "./pages/catalogView/catalogSlice";
import locationsReducer from "./pages/locationView/locationsSlice";
import frequencyReducer from "./pages/FrequencyView/frequencySlice";

const authPersistConfig = {
    key: "auth",
    storage,
    whitelist: ["token", "user"],
};

const appReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    ui: uiReducer,
    users: usersReducer,
    brands: brandReducer,
    counts: countsReducer,
    vendors: vendorReducer,
    catalog: catalogReducer,
    reports: reportsReducer,
    inventory: inventoryReducer,
    locations: locationsReducer,
    frequencies: frequencyReducer,
});

const rootReducer = (state, action) => {
    if (action.type === "RESET_ALL") {
        state = undefined;
    }
    return appReducer(state, action);
};

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    "persist/PERSIST",
                    "persist/REHYDRATE",
                    "persist/FLUSH",
                    "persist/PAUSE",
                    "persist/PURGE",
                    "persist/REGISTER",
                ],
            },
        }),
    devTools: import.meta.env.MODE !== "production",
});

export const persistor = persistStore(store);
export default store;
