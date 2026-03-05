import store from './index';
import theme from './theme';
import { Provider } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Notification from './components/Notification';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';


//--------------------------------
// :: App Function
//--------------------------------

/*
This defines the `App` component that **wraps the application with Redux for state management, 
MUI Theme Provider for consistent styling, React Router for routing, renders all routes, 
and includes a global notification system**.
*/

const App = () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
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
