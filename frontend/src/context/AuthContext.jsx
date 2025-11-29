/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { addAuthRefreshListener } from '../services/api';
import authAPI from '../services/authAPI';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/authSlice';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const fetchUser = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      // Ensure axios knows about this token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
    // Register refresh listener
    const unregister = addAuthRefreshListener((newAccessToken) => {
      // Update axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      // Refresh current user in Redux
      dispatch(fetchCurrentUser());
      // Update local user in context too
      fetchUser();
    });

    return () => {
      unregister();
    };
  }, [dispatch, fetchUser]);

  

  const login = async (username, password) => {
    const response = await authAPI.login(username, password);
    // Save tokens
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    // Update axios default header
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    await fetchUser();
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
    // Make sure axios no longer sends Authorization header
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.is_superuser;
  const isManager = user?.role === 'manager' || isAdmin;
  const isStaff = user?.role === 'staff' || isManager;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isManager, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};
