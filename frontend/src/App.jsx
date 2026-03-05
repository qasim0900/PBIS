import store from './index';
import { Provider } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Notification from './components/Notification';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as MuiThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme/index.js';

const App = () => (
  <Provider store={store}>
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
