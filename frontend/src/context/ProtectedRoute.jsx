import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { selectIsAuthenticated, selectLoading, selectIsAdmin, selectIsManager, selectUser } from '../pages/loginView/authSlice';

const ProtectedRoute = ({ children, requireAdmin = false, requireManager = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const isManager = useSelector(selectIsManager);

  if (isAuthenticated && !user && loading) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
      <CircularProgress size={60} />
      <Typography variant="h6">Loading user data...</Typography>
    </Box>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/counts" replace />;
  if (requireManager && !isManager) return <Navigate to="/counts" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
