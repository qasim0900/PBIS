import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { selectAuth, selectIsManager, selectIsAdmin, fetchCurrentUser } from './store/slices/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import CountsView from './pages/CountsView';
import LowStockView from './pages/LowStockView';
import ReportsView from './pages/ReportsView';
import LocationsView from './pages/LocationsView';
import CatalogView from './pages/CatalogView';
import OverridesView from './pages/OverridesView';
import UsersView from './pages/UsersView';

export default function AppRoutes() {
  const { isAuthenticated, token } = useSelector(selectAuth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/counts" /> : <Login />} />
      <Route path="/counts" element={<ProtectedRoute><Layout><CountsView /></Layout></ProtectedRoute>} />
      <Route path="/low-stock" element={<ProtectedRoute requireManager><Layout><LowStockView /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute requireManager><Layout><ReportsView /></Layout></ProtectedRoute>} />
      <Route path="/locations" element={<ProtectedRoute requireAdmin><Layout><LocationsView /></Layout></ProtectedRoute>} />
      <Route path="/catalog" element={<ProtectedRoute requireAdmin><Layout><CatalogView /></Layout></ProtectedRoute>} />
      <Route path="/overrides" element={<ProtectedRoute requireAdmin><Layout><OverridesView /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute requireAdmin><Layout><UsersView /></Layout></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/counts" />} />
      <Route path="*" element={<Navigate to="/counts" />} />
    </Routes>
  );
}
