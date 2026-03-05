import store from './index';
import { Provider } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Notification from './components/Notification';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme.js';


//--------------------------------
// :: App Function
//--------------------------------

/*
This defines the `App` component that **wraps the application with Redux for state management, 
React Router for routing, renders all routes, and includes a global notification system**.
*/

const App = () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Notification />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </Provider>
);


//--------------------------------
// :: Export App Function
//--------------------------------

/*
This line **exports the `App` component as the default export**, allowing it to be 
imported elsewhere in the project without using curly braces.
*/

export default App;
