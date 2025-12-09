// components/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  selectIsAuthenticated,
  selectLoading,
  selectIsAdmin,
  selectIsManager,
  selectUser,
} from '../store/slices/authSlice';

const ProtectedRoute = ({ children, requireAdmin = false, requireManager = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const loading = useSelector(selectLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const isManager = useSelector(selectIsManager);

  // Agar token hai lekin user abhi load nahi hua → loading dikhao
  if (isAuthenticated && !user && loading) {
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
        <Typography variant="h6">Loading user data...</Typography>
      </Box>
    );
  }

  // Agar bilkul bhi authenticated nahi
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/counts" replace />;
  }
  if (requireManager && !isManager) {
    return <Navigate to="/counts" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;