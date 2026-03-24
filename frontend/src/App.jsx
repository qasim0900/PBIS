import store from './index';
import theme from './theme';
import { Provider } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Notification from './components/Notification';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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

export default App;
