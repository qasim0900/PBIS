// App.jsx
import store from './store';
import { useEffect } from 'react';
import Notification from './components/Notification';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import MenuAppBar from './components/Navbar';
import Login from './pages/Login';
import CountsView from './pages/CountsView';
import LowStockView from './pages/LowStockView';
import ReportsView from './pages/ReportsView';
import LocationsView from './pages/LocationsView';
import CatalogView from './pages/CatalogView';
import OverridesView from './pages/OverridesView';
import UsersView from './pages/UsersView';
import {
  selectAuth,
  selectIsManager,
  selectIsAdmin,
  fetchCurrentUser,
} from './store/slices/authSlice';
import { selectSidebarCollapsed } from './store/slices/uiSlice';


const DRAWER_WIDTH = 2;
const COLLAPSED_WIDTH = 7;

const ProtectedRoute = ({ children, requireManager = false, requireAdmin = false }) => {
  const { isAuthenticated, loading } = useSelector(selectAuth);
  const isManager = useSelector(selectIsManager);
  const isAdmin = useSelector(selectIsAdmin);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/counts" replace />;
  if (requireManager && !isManager) return <Navigate to="/counts" replace />;

  return children;
};


const Layout = ({ children }) => {
  const collapsed = useSelector(selectSidebarCollapsed);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sidebarWidth = isMobile ? 0 : collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MenuAppBar />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            ml: isMobile ? 0 : `${sidebarWidth}px`,
            mt: '64px',
            transition: 'margin 0.3s ease',
            p: isSmallMobile ? 1 : isMobile ? 2 : 3,
            backgroundColor: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
            width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};


const AppRoutes = () => {
  const { token, isAuthenticated } = useSelector(selectAuth);
  const dispatch = useDispatch();
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/counts" /> : <Login />} />
      <Route
        path="/counts"
        element={
          <ProtectedRoute>
            <Layout>
              <CountsView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/low-stock"
        element={
          <ProtectedRoute requireManager>
            <Layout>
              <LowStockView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute requireManager>
            <Layout>
              <ReportsView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/locations"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <LocationsView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalog"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <CatalogView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/overrides"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <OverridesView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <UsersView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/counts" />} />
      <Route path="*" element={<Navigate to="/counts" />} />
    </Routes>
  );
};

const App = () => (
  <Provider store={store}>
    <Router>
      <AppRoutes />
      <Notification />
    </Router>
  </Provider>
);

export default App;
