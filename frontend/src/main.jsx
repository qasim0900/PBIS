import React from 'react';
import App from './App.jsx';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import AppLoading from './components/AppLoading';
import store, { persistor } from './store/index.js';
import { PersistGate } from 'redux-persist/integration/react';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<AppLoading />} persistor={persistor}>
        <CssBaseline />
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);