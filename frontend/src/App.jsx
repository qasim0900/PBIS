import store from './index';
import { Provider } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Notification from './components/Notification';
import { BrowserRouter as Router } from 'react-router-dom';

const App = () => (
  <Provider store={store}>
    <Router>
      <AppRoutes />
      <Notification />
    </Router>
  </Provider>
);

export default App;
