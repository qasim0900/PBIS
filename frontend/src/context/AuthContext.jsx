import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector} from 'react-redux';
import { createContext, useContext, useEffect, useCallback ,useMemo } from 'react';

import {
  fetchCurrentUser,
  selectAuthState,
  logoutUser,
  loginUser,
} from '../pages/loginView/authSlice';



//---------------------------------------
// :: Auth Context Variable
//---------------------------------------

/*
Creates a React context named `AuthContext` with a default value of `null`, 
used to share authentication-related data across the component tree.
*/

const AuthContext = createContext(null);


//---------------------------------------
// :: Auth Function
//---------------------------------------

/*
Defines a custom hook `useAuth` that safely accesses `AuthContext` and throws an error if used outside an `AuthProvider`.
*/

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


//---------------------------------------
// :: Auth Function
//---------------------------------------

/*
Provides an `AuthProvider` that manages authentication state, exposes `login`/`logout` functions, fetches the current 
user on app start, and supplies this data via `AuthContext`.
*/

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, isAuthenticated } = useSelector(selectAuthState);


  //---------------------------------------
  // :: Login function
  //---------------------------------------

  /*
  Defines a `login` function that dispatches the `loginUser` action, returning a success object if 
  it resolves or an error object if it fails.
  */

  const login = useCallback(async (username, password) => {
    try {
      await dispatch(loginUser({ username, password })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);


  //---------------------------------------
  // :: Login Auth function
  //---------------------------------------

  /*
  Defines a `logout` function that clears the user session, removes the auth header, and redirects to the login page.
  */

  const logout = useCallback(() => {
    dispatch(logoutUser());
    delete api.defaults.headers['Authorization'];
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);


  //---------------------------------------
  // :: useEffect Login Auth function
  //---------------------------------------

  /*
  Runs on mount or when `isAuthenticated` changes; if the user is authenticated, it fetches the current user and 
  logs out on failure (e.g., invalid token).
  */

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchCurrentUser())
      .unwrap()
      .catch(() => {
        logout();
      });
  }, [dispatch, isAuthenticated, logout]);


  //---------------------------------------
  // :: context Value function
  //---------------------------------------

  /*
  Memoizes the authentication context value to prevent unnecessary re-renders when `user`, `token`, `login`, 
  `logout`, `loading`, or `isAuthenticated` change.
  */

  const contextValue = useMemo(() => ({
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated,
  }), [user, token, login, logout, loading, isAuthenticated]);


  //---------------------------------------
  // :: Return Code
  //---------------------------------------

  /*
  Wraps child components with `AuthContext.Provider`, supplying the authentication state and actions via `contextValue`.
  */

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
