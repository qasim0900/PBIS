import api, { setAuthCallbacks } from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector} from 'react-redux';
import { createContext, useContext, useEffect, useCallback ,useMemo } from 'react';

import {
  fetchCurrentUser,
  selectAuthState,
  logoutUser,
  loginUser,
} from '../pages/loginView/authSlice';

import { showNotification } from '../api/uiSlice';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, isAuthenticated } = useSelector(selectAuthState);

  const login = useCallback(async (username, password) => {
    try {
      await dispatch(loginUser({ username, password })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutUser());
    delete api.defaults.headers['Authorization'];
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  const showNotificationAction = useCallback((notification) => {
    dispatch(showNotification(notification));
  }, [dispatch]);

  useEffect(() => {
    setAuthCallbacks({
      refreshTokenAction: null,
      logoutAction: logout,
      showNotificationAction: showNotificationAction,
    });
  }, [logout, showNotificationAction]);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchCurrentUser())
      .unwrap()
      .catch(() => {
        logout();
      });
  }, [dispatch, isAuthenticated, logout]);

  const contextValue = useMemo(() => ({
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated,
  }), [user, token, login, logout, loading, isAuthenticated]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
