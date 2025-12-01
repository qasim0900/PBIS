/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import authAPI from '../services/authAPI';
import api, { addAuthRefreshListener } from '../services/api';
import { setLogin, logout as reduxLogout } from '../store/slices/authSlice';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Fetch current user
  const fetchUser = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);

      // Sync with Redux
      dispatch(setLogin({
        user: response.data,
        token: localStorage.getItem('access_token')
      }));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // On mount, check token and fetch user
  useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }

    const unregister = addAuthRefreshListener((newAccessToken) => {
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      fetchUser();
    });

    return () => unregister();
  }, [fetchUser]);

  // Login
  const login = async (username, password) => {
    const response = await authAPI.login(username, password);
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    await fetchUser();
    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    dispatch(reduxLogout());
  };

  // Role checks
  const isAdmin = user?.role === 'admin' || user?.is_superuser;
  const isManager = user?.role === 'manager' || isAdmin;
  const isStaff = user?.role === 'staff' || isManager;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isManager, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};
