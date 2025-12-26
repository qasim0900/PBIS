import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api, { addAuthRefreshListener } from '../services/api';
import { loginUser, fetchCurrentUser, logoutUser, selectAuthState, selectIsAdmin, selectIsManager } from '../store/slices/authSlice';

const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector(selectAuthState);
  const isAdmin = useSelector(selectIsAdmin) || useSelector(selectIsManager);
  const isManager = useSelector(selectIsManager);
  const isStaff = user?.role === 'staff' || isManager;

  useEffect(() => {
    if (token) {
      api.defaults.headers['Authorization'] = `Bearer ${token}`;
      if (!user) dispatch(fetchCurrentUser());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    const unregister = addAuthRefreshListener(newToken => {
      api.defaults.headers['Authorization'] = `Bearer ${newToken}`;
      dispatch(fetchCurrentUser());
    });
    return () => unregister();
  }, [dispatch]);

  const login = async (username, password) => {
    try {
      const result = await dispatch(loginUser({ username, password })).unwrap();
      api.defaults.headers['Authorization'] = `Bearer ${result.tokens.access}`;
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const logout = () => {
    dispatch(logoutUser());
    delete api.defaults.headers['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isManager, isStaff, token }}>
      {children}
    </AuthContext.Provider>
  );
};
