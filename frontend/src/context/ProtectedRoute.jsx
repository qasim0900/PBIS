import { useSelector } from 'react-redux';
import { selectAuth, selectIsAdmin, selectIsManager } from '../store/slices/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false, requireManager = false }) => {
  const { isAuthenticated, loading } = useSelector(selectAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const isManager = useSelector(selectIsManager);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/counts" replace />;
  }

  if (requireManager && !isManager) {
    return <Navigate to="/counts" replace />;
  }

  return children;
};

export default ProtectedRoute;
