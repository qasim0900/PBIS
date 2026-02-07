import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import { configureStore, combineReducers } from "@reduxjs/toolkit";

//---------------------
// :: Slices
//---------------------

/*
These lines **import Redux slice reducers** from different feature modules, each managing a specific part of the application’s state (like UI, authentication, 
users, vendors, catalog, inventory, locations, overrides, and frequency).
*/

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

//-----------------------------------
// :: auth Persist Config Function
//-----------------------------------

/*
This defines a **Redux Persist configuration** for the `auth` slice, telling it to 
**store only the `token` and `user` fields in persistent storage** under the key `"auth"`.
*/

const authPersistConfig = {
    key: "auth",
    storage,
    whitelist: ["token", "user"],
};


//----------------------------
// :: Redux slice Reducers
//----------------------------

/*
This line **combines all individual Redux slice reducers into a single root reducer**, applying persistence to the `auth` 
slice while keeping other slices normal, so the store can manage the entire app state.
*/

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


//-------------------------------
// :: Root Reducer Function
//-------------------------------

/*
This defines a **root reducer wrapper** that **resets the entire Redux state to `undefined`** whenever an action with type 
`"RESET_ALL"` is dispatched, otherwise it delegates state handling to `appReducer`.
*/

const rootReducer = (state, action) => {
    if (action.type === "RESET_ALL") {
        state = undefined;
    }
    return appReducer(state, action);
};


//-----------------------
// :: Configure Store
//-----------------------

/*
This creates the **Redux store** using `rootReducer`, configures middleware to **ignore certain 
non-serializable Redux Persist actions**, and **enables Redux DevTools in development**.
*/

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
    devTools: process.env.NODE_ENV !== "production",
});

//----------------------------------
// :: Export Store/ Persistor
//----------------------------------

/*
These lines **create and export the Redux Persist `persistor`** to manage state persistence, 
and **export the Redux `store` as the default export** for use across the app.
*/

export const persistor = persistStore(store);
export default store;
