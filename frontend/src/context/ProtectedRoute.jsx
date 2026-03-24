import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AppLoading from '../components/AppLoading';
import {
  selectIsAuthenticated,
  selectAuthState
} from '../pages/loginView/authSlice';

const ProtectedRoute = ({ children, requireAdmin = false, requireManager = false }) => {
  const { isAuthenticated, user, loading } = useSelector(selectAuthState);

  const hasRequiredRole = React.useMemo(() => {
    if (!user) return false;
    
    const userRole = user.role;
    
    if (userRole === 'admin') return true;
    
    if (userRole === 'manager') {
      return !requireAdmin;
    }
    
    if (userRole === 'staff') {
      return !requireAdmin && !requireManager;
    }
    
    return false;
  }, [user, requireAdmin, requireManager]);

  if (loading) return <AppLoading />;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (!hasRequiredRole) {
    return <Navigate to="/counts" replace />;
  }

  return <>{children}</>;
};

export default React.memo(ProtectedRoute);
