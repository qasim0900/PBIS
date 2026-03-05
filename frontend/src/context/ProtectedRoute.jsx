import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AppLoading from '../components/AppLoading';
import {
  selectIsAuthenticated,
  selectAuthState
} from '../pages/loginView/authSlice';

//---------------------------------------
// :: Protected Route Function
//---------------------------------------

/*
Renders a loader while auth state is loading, redirects to `/login` if unauthenticated,
checks role-based permissions, otherwise renders the protected children.
*/

const ProtectedRoute = ({ children, requireAdmin = false, requireManager = false }) => {
  const { isAuthenticated, user, loading } = useSelector(selectAuthState);

  //---------------------------------------
  // :: Role Check Function
  //---------------------------------------

  /*
  Checks if user has required role based on requireAdmin and requireManager props
  */
  const hasRequiredRole = React.useMemo(() => {
    if (!user) return false;
    
    const userRole = user.role;
    
    // Admin can access everything
    if (userRole === 'admin') return true;
    
    // Manager can access manager routes but not admin routes
    if (userRole === 'manager') {
      return !requireAdmin;
    }
    
    // Staff can only access non-restricted routes
    if (userRole === 'staff') {
      return !requireAdmin && !requireManager;
    }
    
    return false;
  }, [user, requireAdmin, requireManager]);

  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  Renders the loader if authentication is loading, redirects to `/login` if not authenticated,
  redirects to `/counts` if insufficient permissions, otherwise renders the protected content.
  */

  if (loading) return <AppLoading />;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (!hasRequiredRole) {
    return <Navigate to="/counts" replace />;
  }

  return <>{children}</>;
};

//---------------------------------------
// :: Export Return Memo Protect Route
//---------------------------------------

/*
Exports the `ProtectedRoute` component wrapped in `React.memo` to prevent unnecessary re-renders.
*/

export default React.memo(ProtectedRoute);
