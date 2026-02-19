import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import store, { persistor } from './index.js';
import AppLoading from './components/AppLoading';
import { PersistGate } from 'redux-persist/integration/react';


//--------------------------------
// :: React Root
//--------------------------------

/*
This line creates a React root by selecting the DOM element with the ID 'root', 
enabling React 18+ to manage and render the app inside it.
*/

const root = ReactDOM.createRoot(document.getElementById('root'));


//--------------------------------
// :: Render DOM
//--------------------------------

/*
This code renders the React app into the root DOM element, 
wrapping it with Redux state management, persisted state handling, global CSS reset, and strict mode checks.
*/


root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<AppLoading />} persistor={persistor}>
        <CssBaseline />
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
