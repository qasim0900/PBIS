import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AppLoading from '../components/AppLoading';
import {
  selectIsAuthenticated,
  selectLoading
} from '../pages/loginView/authSlice';

//---------------------------------------
// :: Protected Route Function
//---------------------------------------

/*
Renders a loader while auth state is loading, redirects to `/login` if unauthenticated, otherwise renders the protected children.
*/

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);


  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  Renders the loader if authentication is loading, redirects to `/login` if not authenticated, 
  otherwise renders the protected content.
  */

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

//---------------------------------------
// :: Export Return Memo Protect Route
//---------------------------------------

/*
Exports the `ProtectedRoute` component wrapped in `React.memo` to prevent unnecessary re-renders.
*/

export default React.memo(ProtectedRoute);
