import store from './index';
import { Provider } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Notification from './components/Notification';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as MuiThemeProvider, CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import theme from './theme/theme.js';


//--------------------------------
// :: App Function
//--------------------------------

/*
This defines the `App` component that **wraps the application with Redux for state management, 
React Router for routing, professional theme system, renders all routes, and includes a global notification system**.
*/

import Footer from './components/Footer';

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Box sx={{ flex: 1 }}>
                <AppRoutes />
              </Box>
            </Box>
            <Notification />
          </AuthProvider>
        </Router>
      </MuiThemeProvider>
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
